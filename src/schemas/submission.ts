import { z } from "zod"

export const runMode = z.enum(['ATTEMPT', 'SUBMIT'])

export type runModeType = z.infer<typeof runMode>

export const supportedLanguages = z.enum(['JAVASCRIPT', 'PYTHON', 'CPP'])

export type supportedLanguagesType = z.infer<typeof supportedLanguages>