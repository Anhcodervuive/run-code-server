import { runModeType } from "~/schemas/submission";
import { languageExecutor } from "./language.executor";
import { runJudge } from "~/docker/runInContainer";
import { getProblemAndTestcase } from "~/service/problem";

export class PythonExecutor extends languageExecutor {
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
            image: "ptn-python-executor:1.0",
            codeFiles: [
                {
                    filename: "main.py",
                    content: code,
                },
            ],
            buildCmd: [], // ❗ Python không cần compile
            runCmd: (inputFile) => [
                "python3",
                "/sandbox/code/main.py",
                inputFile,
            ],
        });
    }
}
