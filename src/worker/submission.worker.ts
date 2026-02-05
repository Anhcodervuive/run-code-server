import { Worker } from "bullmq";
import IORedis from "ioredis";
import { getExecutor } from "~/executors";
import { RunPayload } from "~/schemas/run.schema";

const connection = new IORedis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null
});

export function startSubmissionWorker() {
    const worker = new Worker<RunPayload>(
        "codeRun",
        async (job) => {
            const { code, language, problemId, mode, userId } = job.data;

            console.log("🚀 Processing job", job.id, language, mode, code);

            // 1️⃣ Execute code
            const executor = getExecutor(language)
            const result = await executor.execute(code, problemId, mode, userId);


            // // 2️⃣ Persist result (simplified)
            // await prisma.execution.create({
            //     data: {
            //         submissionId: job.id!.toString(), // or map properly
            //         status: "DONE",
            //     },
            // });

            console.log(result);
            return result;
        },
        {
            connection,
            concurrency: 1, // IMPORTANT: start with 1
        }
    );

    worker.on("failed", (job, err) => {
        console.error("❌ Job failed", job?.id, err);
    });

    worker.on("completed", (job) => {
        console.log("🎉 Job completed", job.id);
    });
}
