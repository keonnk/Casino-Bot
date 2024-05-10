import { pgTable, serial, varchar, integer, uniqueIndex, timestamp } from "drizzle-orm/pg-core"

export const UserTable = pgTable("user", {
    id: serial("id"),
    user_id: varchar("user_id").notNull().primaryKey(), //discord user.id
    balance: integer("balance").notNull().default(0),
    lastDaily: timestamp("lastDaily", {mode: 'date'}).defaultNow()
}, table => {
    return {
        userid_Index: uniqueIndex("userid_Index").on(table.user_id),
    }
})