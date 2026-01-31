import { runInContainer } from "../docker/runInContainer";

export class PythonExecutor {
    async execute(code: string, input?: string) {
        return runInContainer({
            image: "ptn-python-executor:1.0",
            cmd: ["python3", "-c", code],
            stdin: input,
        });
    }
}
