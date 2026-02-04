import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { Prisma } from "~/generated/prisma";
import { runModeType } from "~/schemas/submission";

export type CodeFile = {
    filename: string;
    content: string;
};

export type ProblemWithTestCases = Prisma.ProblemGetPayload<{
    include: {
        testCases: true;
    };
}>;

export type JudgeResult =
    | {
        status: "AC";
        timeMs: number;
    }
    | {
        status: "WA" | "TLE" | "RUNTIME_ERROR";
        failedTestcase: number;
        stdout: string;
        stderr: string;
        timeMs: number;
    };

type RunSingleResult = {
    stdout: string;
    stderr: string;
    exitCode: number | null;
    timeMs: number;
    killed: boolean;
};

function normalizeOutput(s: string) {
    return s.trim().replace(/\s+/g, " ");
}

function runSingleContainer(
    image: string,
    cmd: string[],
    mountDir: string,
    timeoutMs: number
): Promise<RunSingleResult> {
    return new Promise((resolve) => {
        const args = [
            "run",
            "--rm",
            "--memory=256m",
            "--cpus=0.5",
            "--network=none",
            "-v",
            `${mountDir}:/sandbox:rw`,
            image,
            ...cmd,
        ];

        const start = process.hrtime.bigint();
        const proc = spawn("docker", args);

        let stdout = "";
        let stderr = "";
        let killed = false;

        const timer = setTimeout(() => {
            killed = true;
            proc.kill("SIGKILL");
        }, timeoutMs);

        proc.stdout.on("data", (d) => {
            stdout += d.toString();
        });

        proc.stderr.on("data", (d) => {
            stderr += d.toString();
        });

        proc.on("close", (code) => {
            clearTimeout(timer);
            const end = process.hrtime.bigint();

            resolve({
                stdout,
                stderr,
                exitCode: killed ? null : code,
                timeMs: Number(end - start) / 1e6,
                killed,
            });
        });
    });
}

export async function runJudge(payload: {
    runMode: runModeType;
    problem: ProblemWithTestCases;
    image: string;
    codeFiles: CodeFile[];
    buildCmd?: string[]; // ví dụ: ["g++", "main.cpp", "-O2", "-o", "main"]
    runCmd: (inputFile: string) => string[];
}): Promise<JudgeResult> {
    const { problem, image, codeFiles, buildCmd, runCmd } = payload;

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "submission-"));
    const codeDir = path.join(tempDir, "code");
    const inputDir = path.join(tempDir, "inputs");

    fs.mkdirSync(codeDir);
    fs.mkdirSync(inputDir);

    try {
        // 1️⃣ Write code files
        for (const file of codeFiles) {
            fs.writeFileSync(
                path.join(codeDir, file.filename),
                file.content
            );
        }

        // 2️⃣ Compile (nếu có)
        if (buildCmd && buildCmd.length > 0) {
            const build = await runSingleContainer(
                image,
                ["bash", "-c", `cd /sandbox/code && ${buildCmd.join(" ")}`],
                tempDir,
                problem.timeLimitMs
            );

            if (build.exitCode !== 0) {
                return {
                    status: "RUNTIME_ERROR",
                    failedTestcase: -1,
                    stdout: build.stdout,
                    stderr: build.stderr,
                    timeMs: build.timeMs,
                };
            }
        }

        // 3️⃣ Run từng testcase
        for (let i = 0; i < problem.testCases.length; i++) {
            const tc = problem.testCases[i];

            const inputFile = path.join(inputDir, `tc_${i}.in`);
            fs.writeFileSync(inputFile, tc ? tc.input : '');

            const result = await runSingleContainer(
                image,
                runCmd(`/sandbox/inputs/tc_${i}.in`),
                tempDir,
                problem.timeLimitMs
            );

            console.log(result);

            if (result.killed) {
                return {
                    status: "TLE",
                    failedTestcase: i,
                    stdout: result.stdout,
                    stderr: result.stderr,
                    timeMs: result.timeMs,
                };
            }

            if (result.exitCode !== 0) {
                return {
                    status: "RUNTIME_ERROR",
                    failedTestcase: i,
                    stdout: result.stdout,
                    stderr: result.stderr,
                    timeMs: result.timeMs,
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
                    timeMs: result.timeMs,
                };
            }
        }

        return {
            status: "AC",
            timeMs: problem.timeLimitMs,
        };
    } finally {
        // 4️⃣ Cleanup
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}
