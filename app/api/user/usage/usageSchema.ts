import { z } from "zod";

export const AnimationStatusEnum = z.enum(["GENERATING", "RENDERING", "COMPLETED", "FAILED"]);
export const AnimationSourceEnum = z.enum(["WEBSITE", "API", "PLAYGROUND"]);

const usageResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z
        .object({
            credits: z.number(),
            creditsResetAt: z
                .union([z.string(), z.date()])
                .transform((val) => new Date(val).toISOString())
                .nullable(),
            animations: z.array(
                z.object({
                    id: z.string(),
                    status: AnimationStatusEnum,
                    source: AnimationSourceEnum,
                    prompt: z.string(),
                    createdAt: z
                        .union([z.string(), z.date()])
                        .transform((val) => new Date(val).toISOString()),
                    creditsSpent: z.number().optional(),
                })
            ),
            pagination: z
                .object({
                    total: z.number(),
                    page: z.number(),
                    limit: z.number(),
                    totalPages: z.number(),
                })
                .optional(),
        })
        .optional(),
});

export type UsageResponse = z.infer<typeof usageResponse>;
