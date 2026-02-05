import fs from "fs";
import path from "path";
import os from "os";
import { CodeSubmission, Prisma } from "~/generated/prisma";
import { runSingleProcess } from "./runSingleProcess";
import { LANGUAGE_CONFIG } from "~/config/language.config";

export type ProblemWithTestCases = Prisma.ProblemGetPayload<{
    include: { testCases: true };
}>;

export type JudgeResult =
    | { status: "AC"; timeMs: number }
    | { status: "COMPILE_ERROR", stderr: string }
    | {
        status: "WA" | "TLE" | "RUNTIME_ERROR" | "COMPILE_ERROR";
        failedTestcase: number;
        stdout: string;
        stderr: string;
        timeMs: number;
    };

function normalizeOutput(s: string) {
    return s.trim().replace(/\s+/g, " ");
}

export async function runJudge(
    submission: CodeSubmission,
    problem: ProblemWithTestCases,
    code: string
): Promise<JudgeResult> {

    const config = LANGUAGE_CONFIG[submission.language]

    if (!config) {
        throw new Error("Unsupported language");
    }

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "submission-"));
    const codeDir = path.join(tempDir, "code");

    fs.mkdirSync(codeDir);

    try {
        fs.writeFileSync(path.join(codeDir, config.sourceFile), code);

        if ("compile" in config) {
            const compileResult = await runSingleProcess(
                config.compile.cmd,
                config.compile.args,
                {
                    cwd: codeDir,
                    timeoutMs: 5000,
                }
            );

            if (compileResult.exitCode !== 0) {
                return {
                    status: "COMPILE_ERROR",
                    stderr: compileResult.stderr,
                };
            }
        }

        for (let i = 0; i < problem.testCases.length; i++) {
            const tc = problem.testCases[i];

            const result = await runSingleProcess(
                config.run.cmd,
                config.run.args,
                {
                    cwd: codeDir,
                    input: tc ? tc.input : '',
                    timeoutMs: problem.timeLimitMs,
                }
            );

            console.log('result', result);

            if (result.killed) {
                return {
                    status: "TLE",
                    failedTestcase: i,
                    stdout: result.stdout,
                    stderr: result.stderr,
                    // timeMs: result.timeMs,
                    timeMs: 0
                };
            }

            if (result.exitCode !== 0) {
                return {
                    status: "RUNTIME_ERROR",
                    failedTestcase: i,
                    stdout: result.stdout,
                    stderr: result.stderr,
                    // timeMs: result.timeMs,
                    timeMs: 0
                };
            }

            if (
                normalizeOutput(result.stdout) !==
                normalizeOutput(tc ? tc.expected : '')
            ) {
                return {
                    status: "WA",
                    failedTestcase: i,
                    stdout: result.stdout,
                    stderr: result.stderr,
                    // timeMs: result.timeMs,
                    timeMs: 0
                };
            }
        }

        return {
            status: "AC",
            timeMs: problem.timeLimitMs,
        };
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}
