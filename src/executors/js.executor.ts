import { runInContainer } from "../docker/runInContainer";

export class JsExecutor {
    async execute(code: string, input?: string) {
        return runInContainer({
            image: "ptn-js-executor:1.0",
            cmd: ["node", "-e", code],
            stdin: input,
            timeoutMs: 3000
        });
    }
}
