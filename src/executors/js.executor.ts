import { runModeType } from "~/schemas/submission";
import { languageExecutor } from "./language.executor";
import { runJudge } from "~/docker/runInContainer";
import { getProblemAndTestcase } from "~/service/problem";


export class JsExecutor extends languageExecutor {
    async execute(
        code: string,
        problemId: string,
        mode: runModeType = "ATTEMPT"
    ) {
        const problem = await getProblemAndTestcase(problemId);
        console.log(problem);
        if (!problem) throw new Error("Problem not found");
        return runJudge({
            runMode: mode,
            problem,
            image: "ptn-js-executor:1.0",
            codeFiles: [
                {
                    filename: "main.js",
                    content: code,
                },
            ],
            buildCmd: [], // JS không cần build
            runCmd: (inputFile) => [
                "node",
                "/sandbox/code/main.js",
                inputFile,
            ],
        });
    }
}
