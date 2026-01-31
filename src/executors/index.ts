import { PythonExecutor } from "./python.executor";
import { JsExecutor } from "./js.executor";

export function getExecutor(language: "python" | "js") {
    if (language === "python") return new PythonExecutor();
    if (language === "js") return new JsExecutor();
    throw new Error("Unsupported language");
}
