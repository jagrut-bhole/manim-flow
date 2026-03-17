import { z } from "zod";

// Create api key part
export const createApiKeyRequest = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(20, "Name must be at most 20 characters long"),
});

const createApiKeyResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z
        .object({
            key: z.string(),
            prefix: z.string(),
            name: z.string(),
        })
        .optional(),
});

export type CreateApiKeyResponse = z.infer<typeof createApiKeyResponse>;

// Delete api key part
export const deleteApiKeyRequest = z.object({
    apiKeyId: z.string().min(1, "Api key id is required"),
});

export const deleteApiKeyResponse = z
    .object({
        success: z.boolean(),
        message: z.string(),
    })
    .optional();

export type DeleteApiKeyResponse = z.infer<typeof deleteApiKeyResponse>;

// update name of api key
export const updateApiKeyRequest = z.object({
    apiKeyId: z.string().min(1, "Api key id is required"),
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(20, "Name must be at most 20 characters long"),
});

export const updateApiKeyResponse = z
    .object({
        success: z.boolean(),
        message: z.string(),
    })
    .optional();

export type UpdateApiKeyResponse = z.infer<typeof updateApiKeyResponse>;

// Get all api keys part
export const getAllApiKeysResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z
        .object({
            apiKeys: z.array(
                z.object({
                    id: z.string(),
                    name: z.string(),
                    keyPrefix: z.string(),
                    createdAt: z.date(),
                    lastUsedAt: z.date().nullable(),
                })
            ),
        })
        .optional(),
});

export type GetAllApiKeysResponse = z.infer<typeof getAllApiKeysResponse>;
