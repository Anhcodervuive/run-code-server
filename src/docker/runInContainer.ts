import { spawn } from "child_process";

export type ContainerRunPayload = {
    image: string;
    cmd: string[];
    stdin?: string | undefined;
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
    const { image, cmd, stdin, timeoutMs = 2000 } = payload;

    return new Promise((resolve) => {
        const args = [
            "run",
            "--rm",
            "--memory=256m",
            "--cpus=0.5",
            "--network=none",
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

        proc.stdout.on("data", (d) => (stdout += d));
        proc.stderr.on("data", (d) => (stderr += d));

        if (stdin) {
            proc.stdin.write(stdin);
        }
        proc.stdin.end();

        proc.on("close", (code) => {
            clearTimeout(timer);
            const end = process.hrtime.bigint();

            resolve({
                stdout,
                stderr,
                exitCode: killed ? null : code,
                timeMs: Number(end - start) / 1e6,
            });
        });
    });
};
