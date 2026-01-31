import { Worker } from "bullmq";
import IORedis from "ioredis";
import { runInContainer } from "../docker/runInContainer";
import { RunPayload } from "../schemas/run.schema";
import { warmUpDocker } from "./warmup";

export const startWorker = async () => {
    await warmUpDocker();
    const connection = new IORedis(process.env.REDIS_URL!);

    new Worker<RunPayload>(
        "submission",
        async (job) => {
            console.log(`▶ Running job ${job.id}`);

            // const result = await runInContainer(job.data);

            console.log("✅ Result:",);
        },
        {
            connection,
            concurrency: 1,
        }
    );

    console.log("👷 Worker started");
};
