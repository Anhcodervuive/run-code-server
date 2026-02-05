import { runJudge } from "~/judge/runJudge";
import { runModeType } from "~/schemas/submission";
import { getProblemAndTestcase } from "~/service/problem";
import { createCodeSubmission } from "~/service/submission";
import { hashString } from "~/utils/stringControl";

export class JsExecutor {
    async execute(code: string, problemId: string, mode: runModeType, userId: string) {
        const problem = await getProblemAndTestcase(problemId);
        if (!problem) throw new Error("Problem not found");

        const hashedCode = hashString(code)
        const submission = await createCodeSubmission(problemId, userId, {
            sourceCode: code,
            language: "JAVASCRIPT",
            type: mode,
            codeHash: hashedCode,
            problemId,
            userId,
        })

        return runJudge(submission, problem, code);
    }
}
