export type TestCase = {
    input: string;
    output: string;
};

export type Problem = {
    testCases: TestCase[];
    timeLimitMs: number;
};

export type Submission = {
    code: string;
    language: "js" | "python" | "cpp";
};
