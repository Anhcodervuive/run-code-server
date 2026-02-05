// runSingleProcess.ts
import { spawn } from "child_process";

type Options = {
    cwd: string;
    input?: string;
    timeoutMs: number;
};

export function runSingleProcess(
    cmd: string,
    args: string[],
    options: Options
): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
    killed: boolean;
}> {
    return new Promise((resolve) => {
        const child = spawn(cmd, args, { cwd: options.cwd });

        let stdout = "";
        let stderr = "";
        let killed = false;

        const timer = setTimeout(() => {
            killed = true;
            child.kill("SIGKILL");
        }, options.timeoutMs);

        if (options.input) {
            child.stdin.write(options.input);
            child.stdin.end();
        }

        child.stdout.on("data", (d) => (stdout += d.toString()));
        child.stderr.on("data", (d) => (stderr += d.toString()));

        child.on("close", (code) => {
            clearTimeout(timer);
            resolve({
                stdout,
                stderr,
                exitCode: code,
                killed,
            });
        });
    });
}
