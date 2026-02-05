
import { JsExecutor } from "./js.executor";
import { supportedLanguagesType } from "~/schemas/submission";
import { PythonExecutor } from "./python.executor";
import { CppExecutor } from "./Cpp.executor";

export function getExecutor(language: supportedLanguagesType) {
    if (language === "PYTHON") return new PythonExecutor();
    if (language === "JAVASCRIPT") return new JsExecutor();
    if (language === "CPP") return new CppExecutor();
    throw new Error("Unsupported language");
}
