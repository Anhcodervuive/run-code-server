import { z } from "zod";

export const runSchema = z.object({
    language: z.enum(["js", "python"]),
    code: z.string().max(20_000),
    input: z.string().optional(),
});

export type RunPayload = z.infer<typeof runSchema>;
