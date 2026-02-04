import { z } from "zod";
import { runMode, supportedLanguages } from "./submission";


export const runSchema = z.object({
    language: supportedLanguages,
    code: z.string().max(20_000),
    problemId: z.string(),
    mode: runMode
});

export type RunPayload = z.infer<typeof runSchema>;
