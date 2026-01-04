"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

const UpdateUserSchema = z.object({
    id: z.string(),
    name: z.string().optional(),
    lastName: z.string().optional(),
    sector: z.string().optional(),
    unit: z.string().optional(),
    management: z.string().optional(),
    ordinaryLicenseDays: z.coerce.number().optional(),
    article41Days: z.coerce.number().optional(),
    sickLeaveDays: z.coerce.number().optional(),
    familyCareDays: z.coerce.number().optional(),
    travelDays: z.coerce.number().optional(),
})

export async function updateUser(values: z.infer<typeof UpdateUserSchema>) {
    const session = await auth()

    if (!session || !session.user) {
        return { error: "Unauthorized" }
    }

    // Fetch current user from DB to get latest role/permissions
    const currentUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, manageableSector: true }
    })

    if (!currentUser) return { error: "Unauthorized" }

    const targetUser = await db.user.findUnique({
        where: { id: values.id }
    })

    if (!targetUser) return { error: "User not found" }

    // RBAC Logic
    const isAdmin = currentUser.role === "ADMIN"
    // Assuming 'manageableSector' corresponds to 'management' (Gerencia) or 'sector'
    // The requirement says "editar los usuarios de ciertas gerencias".
    // So we check if currentUser.manageableSector matches targetUser.management
    const isManager = currentUser.role === "MANAGER"
    const canManage = isManager && currentUser.manageableSector && (currentUser.manageableSector === targetUser.management)

    if (!isAdmin && !canManage) {
        return { error: "You do not have permission to edit this user." }
    }

    const { id, ...data } = values

    await db.user.update({
        where: { id },
        data: {
            ...data,
            ordinaryLicenseDays: Number(data.ordinaryLicenseDays),
            article41Days: Number(data.article41Days),
            sickLeaveDays: Number(data.sickLeaveDays),
            familyCareDays: Number(data.familyCareDays),
            travelDays: Number(data.travelDays),
        },
    })

    revalidatePath("/")
    return { success: "User updated successfully!" }
}
