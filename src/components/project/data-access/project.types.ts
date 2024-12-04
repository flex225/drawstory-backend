import { Prisma } from "@prisma/client"

const projectWithScenes = Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: { id: true, title: true, createdAt: true, updatedAt: true },
    include: { scenes: true, }
})

export type ProjectWithScenes = Prisma.ProjectGetPayload<typeof projectWithScenes>

const newProject = Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true
    }
})

export type NewProject = Prisma.ProjectGetPayload<typeof newProject>

const lightweightProject = Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: {
        id: true,
        title: true,
        imageUrl: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true
    }
})

export type LightweightProject = Prisma.ProjectGetPayload<typeof lightweightProject>

const lightweightScene = Prisma.validator<Prisma.SceneDefaultArgs>()({
    select: {
        id: true,
        imageUrl: true,
        description: true,
        indexInProject: true,
        voiceOver: true,
        createdAt: true,
        updatedAt: true
    }
})

export type LightweightScene = Prisma.SceneGetPayload<typeof lightweightScene>