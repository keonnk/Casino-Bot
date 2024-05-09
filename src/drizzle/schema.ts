import { pgTable, serial, varchar, integer, uniqueIndex } from "drizzle-orm/pg-core"

export const UserTable = pgTable("user", {
    id: serial("id"),
    user_id: varchar("user_id").notNull().primaryKey(), //discord user.id
    balance: integer("balance").notNull().default(0)
}, table => {
    return {
        userid_Index: uniqueIndex("userid_Index").on(table.user_id),
    }
})