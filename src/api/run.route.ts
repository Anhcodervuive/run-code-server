import express from "express";
import { runSchema } from "../schemas/run.schema";
import { getExecutor } from "~/executors";

export const startApiServer = () => {
    const app = express();
    app.use(express.json());

    app.post("/run", async (req, res) => {
        const parsed = runSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json(parsed.error);
        }

        const executor = getExecutor(parsed.data.language);
        const result = await executor.execute(parsed.data.code, parsed.data.input)

        return res.json({
            status: "DONE",
            result,
        });
    });

    const port = 3000;
    app.listen(port, () => {
        console.log(`🚀 API server running on port ${port}`);
    });
};
