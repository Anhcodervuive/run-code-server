// import { startApiServer } from "./api/run.route";
// import { startWorker } from "./worker/submission.worker";
import { loadEnv } from "~/config/env";

loadEnv();

// const mode = process.argv[2];

// if (mode === "api") {
//     startApiServer();
// } else if (mode === "worker") {
//     startWorker();
// } else {
//     console.error("❌ Please specify mode: api | worker");
//     process.exit(1);
// }

import { startSubmissionWorker } from "./worker/submission.worker";

console.log("🚀 Code Execution Service started");
startSubmissionWorker();