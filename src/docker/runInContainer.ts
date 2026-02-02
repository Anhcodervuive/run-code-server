import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export type CodeFile = {
    filename: string;
    content: string;
};

export type ContainerRunPayload = {
    image: string;
    cmd: string[];
    codeFiles: CodeFile[];
    stdin?: string;
    timeoutMs?: number;
};

export const runInContainer = (
    payload: ContainerRunPayload
): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
    timeMs: number;
}> => {
    const {
        image,
        cmd,
        codeFiles,
        stdin,
        timeoutMs = 3000,
    } = payload;

    return new Promise((resolve) => {
        // 1️⃣ Create temp folder (HOST)
        const tempDir = fs.mkdtempSync(
            path.join(os.tmpdir(), "submission-")
        );

        // 2️⃣ Write code files
        for (const file of codeFiles) {
            fs.writeFileSync(
                path.join(tempDir, file.filename),
                file.content
            );
        }

        // 3️⃣ Docker args
        const args = [
            "run",
            "--rm",
            "--memory=256m",
            "--cpus=0.5",
            "--network=none",
            "-v",
            `${tempDir}:/sandbox:ro`,
            image,
            ...cmd,
        ];

        const start = process.hrtime.bigint();
        const proc = spawn("docker", args, {
            stdio: ["pipe", "pipe", "pipe"],
        });

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

        if (stdin) {
            proc.stdin.write(stdin);
        }
        proc.stdin.end();

        // 4️⃣ IMPORTANT: cleanup + resolve ONLY here
        proc.on("close", (code: number | null) => {
            clearTimeout(timer);

            const end = process.hrtime.bigint();

            // ✅ cleanup AFTER container finished
            fs.rmSync(tempDir, { recursive: true, force: true });

            resolve({
                stdout,
                stderr,
                exitCode: killed ? null : code,
                timeMs: Number(end - start) / 1e6,
            });
        });
    });
};
