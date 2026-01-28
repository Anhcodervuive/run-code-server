import { spawn } from "child_process";
import { RunPayload } from "../schemas/run.schema";

type RunResult = {
    status: "OK" | "TLE" | "RUNTIME_ERROR";
    stdout: string;
    stderr: string;
    timeMs: number;
    exitCode: number | null;
};

export const runInContainer = (payload: RunPayload): Promise<RunResult> => {
    return new Promise((resolve) => {
        const { language, code, input } = payload;

        const image =
            language === "js"
                ? process.env.DOCKER_JS_IMAGE || "node:24-alpine"
                : process.env.DOCKER_PY_IMAGE || "python:3.11-alpine";

        const cmd =
            language === "js"
                ? ["node", "-e", code]
                : ["python", "-c", code];

        const args = [
            "run",
            "--rm",
            "--memory=256m",
            "--cpus=0.5",
            "--network=none",
            image,
            ...cmd,
        ];

        const startTime = process.hrtime.bigint();

        const docker = spawn("docker", args, {
            stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";
        let finished = false;

        docker.stdout.on("data", (d) => {
            stdout += d.toString();
        });

        docker.stderr.on("data", (d) => {
            stderr += d.toString();
        });

        if (input) {
            docker.stdin.write(input);
        }
        docker.stdin.end();

        const timeoutMs = Number(process.env.DOCKER_TIME_LIMIT_MS) || 2000;

        const timeout = setTimeout(() => {
            if (finished) return;

            docker.kill("SIGKILL");

            const endTime = process.hrtime.bigint();

            finished = true;
            resolve({
                status: "TLE",
                stdout,
                stderr,
                timeMs: Number(endTime - startTime) / 1_000_000,
                exitCode: null,
            });
        }, timeoutMs);

        docker.on("close", (code) => {
            if (finished) return;

            clearTimeout(timeout);
            const endTime = process.hrtime.bigint();

            finished = true;
            resolve({
                status: code === 0 ? "OK" : "RUNTIME_ERROR",
                stdout,
                stderr,
                timeMs: Number(endTime - startTime) / 1_000_000,
                exitCode: code,
            });
        });
    });
};
