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

export async function updateBalance(params: {user_id: string, currentBalance: number, amount: number, isDeposit: boolean}) {
    const {user_id, currentBalance, amount, isDeposit} = params
    let result

    if(isDeposit) {
        result = await db
            .update(UserTable)
            .set({balance: currentBalance + amount})
            .where(eq(UserTable.user_id, user_id))
            .returning()
    }
    else {
            result = await db
            .update(UserTable)
            .set({balance: currentBalance - amount})
            .where(eq(UserTable.user_id, user_id))
            .returning()
    }    

    return result[0]
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