import { prisma } from "~/config/prisma";
import { Prisma } from "~/generated/prisma";

export const createCodeSubmission = async (problemId: string, userId: string, payload: Omit<Prisma.CodeSubmissionGetPayload<null>, 'id' | 'createdAt' | 'updatedAt'>) => {
    return prisma.codeSubmission.create({
        data: {
            ...payload,
            userId,
            problemId,
        },
    });

}