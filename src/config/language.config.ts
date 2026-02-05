// language-config.ts
export const LANGUAGE_CONFIG = {
    JAVASCRIPT: {
        sourceFile: "main.js",
        run: {
            cmd: "node",
            args: ["main.js"] as string[],
        },
    },

    PYTHON: {
        sourceFile: "main.py",
        run: {
            cmd: "python",
            args: ["main.py"] as string[],
        },
    },

    CPP: {
        sourceFile: "main.cpp",
        compile: {
            cmd: "g++",
            args: ["main.cpp", "-O2", "-std=c++17", "-o", "main"] as string[]
        },
        run: {
            cmd: "./main",
            args: [] as string[],
        },
    },
} as const;

export type Language = keyof typeof LANGUAGE_CONFIG;
