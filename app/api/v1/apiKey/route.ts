import prisma from "@/lib/prisma";
import { createApiKey } from "@/services/apiServices";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelpers";
import {
    invalidateApiKeyCache,
    generateApiKey,
    hashApiKey,
    getKeyPrefix,
} from "@/lib/apiKey/apiKey";

// Create API Key
import { createApiKeyRequest, CreateApiKeyResponse } from "./apiKeySchema";

// Delete API Key
import { deleteApiKeyRequest, DeleteApiKeyResponse } from "./apiKeySchema";

// Update API Key
import { updateApiKeyRequest, UpdateApiKeyResponse } from "./apiKeySchema";

// Get all api keys
import { GetAllApiKeysResponse } from "./apiKeySchema";

export async function POST(req: NextRequest): Promise<NextResponse<CreateApiKeyResponse>> {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const body = await req.json();

        const parsed = createApiKeyRequest.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request body",
                },
                {
                    status: 400,
                }
            );
        }

        const { name } = parsed.data;

        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Name is required for api key creation",
                },
                {
                    status: 400,
                }
            );
        }

        const keyCount = await prisma.apiKey.count({
            where: {
                userId: user.id,
            },
        });

        if (keyCount >= 5) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You can have a maximum of 5 active API keys.",
                },
                {
                    status: 400,
                }
            );
        }

        // Generate key
        const rawKey = generateApiKey();
        const prefix = getKeyPrefix(rawKey);
        const hash = hashApiKey(rawKey);

        await prisma.apiKey.create({
            data: {
                userId: user.id,
                name: name.trim(),
                keyPrefix: prefix,
                keyHash: hash,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Save this key now — it will not be shown again.",
                data: {
                    key: rawKey, // shown once to user, store it safely
                    prefix,
                    name: name.trim(),
                },
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(req: NextRequest): Promise<NextResponse<DeleteApiKeyResponse>> {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const body = await req.json();

        const parsed = deleteApiKeyRequest.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request data",
                },
                {
                    status: 400,
                }
            );
        }

        const { apiKeyId } = parsed.data;

        const apiKey = await prisma.apiKey.findUnique({
            where: {
                id: apiKeyId,
                userId: user.id,
            },
        });

        if (!apiKey) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Api key not found",
                },
                {
                    status: 404,
                }
            );
        }

        if (apiKey.userId !== user.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized request",
                },
                {
                    status: 401,
                }
            );
        }

        await prisma.apiKey.delete({
            where: {
                id: apiKeyId,
            },
        });

        await invalidateApiKeyCache(apiKey.keyPrefix);

        return NextResponse.json(
            {
                success: true,
                message: "API key revoked.",
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log("Error while deleting api key", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            {
                status: 500,
            }
        );
    }
}

export async function PATCH(req: NextRequest): Promise<NextResponse<UpdateApiKeyResponse>> {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const body = await req.json();

        const parsed = updateApiKeyRequest.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request data",
                },
                {
                    status: 400,
                }
            );
        }

        const { apiKeyId, name } = parsed.data;

        const apiKey = await prisma.apiKey.findUnique({
            where: {
                id: apiKeyId,
            },
        });

        if (!apiKey) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Api key not found",
                },
                {
                    status: 404,
                }
            );
        }

        if (apiKey.userId !== user.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized request",
                },
                {
                    status: 401,
                }
            );
        }

        await prisma.apiKey.update({
            where: {
                id: apiKeyId,
            },
            data: {
                name,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Name updated successfully!!",
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log("Error while updating api key", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            {
                status: 500,
            }
        );
    }
}

export async function GET(): Promise<NextResponse<GetAllApiKeysResponse>> {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized Request",
                },
                {
                    status: 401,
                }
            );
        }

        const apiKeys = await prisma.apiKey.findMany({
            where: {
                userId: user.id,
            },
            select: {
                id: true,
                name: true,
                keyPrefix: true,
                createdAt: true,
                lastUsedAt: true,
            },
        });

        if (!apiKeys) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No Api Keys found",
                },
                {
                    status: 401,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Api keys fetch successfully!!",
                data: {
                    apiKeys,
                },
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log("Error while fetching api keys", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            {
                status: 500,
            }
        );
    }
}
