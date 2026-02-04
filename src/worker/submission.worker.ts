import { Worker } from "bullmq";
import IORedis from "ioredis";
import { RunPayload } from "../schemas/run.schema";
import { warmUpDocker } from "./warmup";
import { getExecutor } from "~/executors";

export const startWorker = async () => {
    await warmUpDocker();
    const connection = new IORedis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: null,
    });

    new Worker<RunPayload>(
        "codeRun",
        async (job) => {
            console.log(`▶ Running job ${job.id}`);

            const { code, language, mode, problemId } = job.data
            console.log(language, code, mode, problemId);

            const codeExecutor = getExecutor(language)

            const result = await codeExecutor.execute(code, problemId, mode)
            console.log(result);

            console.log("✅ Result:",);
        },
        {
            connection,
            concurrency: 1,
        }
    );

    console.log("👷 Worker started");
};
