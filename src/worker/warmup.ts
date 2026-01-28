import { spawn } from "child_process";

export const warmUpDocker = async () => {
    const images = [
        process.env.DOCKER_JS_IMAGE || "node:24-alpine",
        process.env.DOCKER_PY_IMAGE || "python:3.11-alpine",
    ];

    for (const image of images) {
        await new Promise<void>((resolve) => {
            const p = spawn("docker", ["run", "--rm", image, "echo", "warmup"]);
            p.on("close", () => resolve());
        });
    }

    console.log("🔥 Docker warm-up completed");
};
