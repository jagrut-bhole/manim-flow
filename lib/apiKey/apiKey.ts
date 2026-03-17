import crypto from "crypto";
import { customAlphabet } from "nanoid";
import prisma from "../prisma";
import { redis } from "../upstash-redis/redis";
import { TURBOPACK_CLIENT_MIDDLEWARE_MANIFEST } from "next/dist/shared/lib/constants";

// generation of user api key
const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 40);
export function generateApiKey(): string {
    return `sk_${nanoid()}`;
}

// key hashing
export function hashApiKey(key: string): string {
    return crypto.createHash("sha256").update(key).digest("hex");
}

// Extract prefix for fast DB lookup (first 12 chars: "sk_5UPneJm7A")
export function getKeyPrefix(key: string): string {
    return key.slice(0, 12);
}

// types
export interface ValidatedApiKey {
    userId: string;
    keyId: string;
    isActive: boolean;
}

export type ApiKeyValidationResult =
    | { valid: true; data: ValidatedApiKey }
    | { valid: false; error: string; status: 401 | 403 | 429 };

// ─── Validate API Key ─────────────────────────────────────────────────────────
export async function validateApiKey(rawKey: string): Promise<ApiKeyValidationResult> {
    if (!rawKey || !rawKey.startsWith("sk_")) {
        return {
            valid: false,
            error: "Invalid API key format",
            status: 401,
        };
    }

    const prefix = getKeyPrefix(rawKey);
    const hash = hashApiKey(rawKey);

    // redis check
    const cacheKey = `apikey:${prefix}`;
    const cached = await redis.get<ValidatedApiKey>(cacheKey);

    if (cached) {
        if (!cached?.isActive) {
            return {
                valid: false,
                error: "API key is inactive",
                status: 403,
            };
        }
        return {
            valid: true,
            data: cached,
        };
    }

    // DB checkup
    const apiKey = await prisma.apiKey.findUnique({
        where: {
            keyPrefix: prefix,
        },
        select: {
            id: true,
            userId: true,
            keyHash: true,
            isActive: true,
        },
    });

    if (!apiKey) {
        return {
            valid: false,
            error: "API key not found",
            status: 401,
        };
    }

    if (apiKey.keyHash !== hash) {
        return {
            valid: false,
            error: "Invalid API key",
            status: 401,
        };
    }

    if (!apiKey.isActive) {
        return {
            valid: false,
            error: "API key is inactive",
            status: 403,
        };
    }

    // caching data result for 5 min
    const validatedData: ValidatedApiKey = {
        userId: apiKey.userId,
        keyId: apiKey.id,
        isActive: apiKey.isActive,
    };

    await redis.set(cacheKey, validatedData, { ex: 60 * 5 });

    prisma.apiKey
        .update({
            where: {
                id: apiKey.id,
            },
            data: {
                lastUsedAt: new Date(),
                totalRequests: {
                    increment: 1,
                },
            },
        })
        .catch((err) => console.error("Failed to update usage:", err));

    return {
        valid: true,
        data: validatedData,
    };
}

// Invalidate the cache when key is deleteda or disabled
export async function invalidateApiKeyCache(prefix: string): Promise<void> {
    await redis.del(`apikey:${prefix}:${prefix}`);
}
