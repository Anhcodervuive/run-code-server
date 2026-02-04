import { getProblemAndTestcase } from "~/service/problem";

export class languageExecutor {
    async getProblemData(problemId: string) {
        return getProblemAndTestcase(problemId)
    }
}