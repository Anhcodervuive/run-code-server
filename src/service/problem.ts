import { prisma } from "~/config/prisma"

export const getProblemAndTestcase = async (id: string) => {
    return prisma.problem.findFirst({
        where: {
            id,
        },
        include: {
            testCases: true,
        },
    })
}