import { PythonExecutor } from "./python.executor";
import { JsExecutor } from "./js.executor";
import { supportedLanguagesType } from "~/schemas/submission";

export function getExecutor(language: supportedLanguagesType) {
    if (language === "PYTHON") return new PythonExecutor();
    if (language === "JAVASCRIPT") return new JsExecutor();
    throw new Error("Unsupported language");
}
