import { db } from "../db.js";
import { UserTable } from "../schema.js";
import { eq, sql } from "drizzle-orm"

export async function getUser(user_id: string) {
    const user = await db.select().from(UserTable).where(eq(UserTable.user_id, user_id))

    if (user.length === 0) {
        throw new Error("No user was found")
    }

    return user[0]
}

export async function updateBalance(user_id: string, balance: number) {
    const user = await db.update(UserTable).set({balance}).where(eq(UserTable.user_id, user_id)).returning()

    if(user[0].balance !== balance) {
        throw new Error("Balance was not properly updated")
    }

    return user[0]
}

export async function giveDailyBalance(user_id: string) {
    const user = await db.update(UserTable).set({balance: sql`balance + 1000`, lastDaily: new Date()}).where(eq(UserTable.user_id, user_id)).returning()

    return user[0]
}

export async function createUser(user_id: string) {
    const user = await db.insert(UserTable).values({
        user_id,
        balance: 1000 //Starting balance
    }).onConflictDoNothing().returning()

    if(user.length === 0) {
        throw new Error("User was not created")
    }

    return user[0]
}