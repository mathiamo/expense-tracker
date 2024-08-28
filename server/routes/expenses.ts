import {Hono} from "hono";
import {zValidator} from "@hono/zod-validator";

import { getUser } from "../kinde.ts";

import { db } from "../db";
import {expenses as expensesTable, insertExpensesSchema} from "../db/schema/expenses.ts";
import {and, desc, eq, sum} from "drizzle-orm";
import {createExpenseSchema} from "../sharedTypes.ts";

export const expensesRoute = new Hono()
.get("/", getUser, async (c) => {
    const user = c.var['user']

    const expenses = await db
        .select()
        .from(expensesTable)
        .where(eq(expensesTable.userId, user.id))
        .orderBy(desc(expensesTable.createdAt))
        .limit(100)


    return c.json({expenses: expenses});
})
.post("/", getUser, zValidator("json", createExpenseSchema), async(c) => {
    const expense = c.req.valid("json");
    const user = c.var['user'];


    const validatedExpense = insertExpensesSchema.parse({
        ...expense,
        userId: user.id,
    });
    const result = await db
        .insert(expensesTable)
        .values(validatedExpense)
        .returning()
        .then((res) => res[0]);

    c.status(201)
    return c.json(result);
})
.get("/total-spent", getUser,async (c) => {
    const user = c.var['user'];
    const result = await db
        .select({total: sum(expensesTable.amount)})
        .from(expensesTable)
        .where(eq(expensesTable.userId, user.id))
        .limit(1)
        .then(res => res[0])

    return c.json(result)
})
.get("/:id{[0-9]+}", getUser,async (c) => {
    const id = Number.parseInt(c.req.param('id'));
    const user = c.var['user'];
    const expense = await db
        .select()
        .from(expensesTable)
        .where(and(eq(expensesTable.userId, user.id), eq(expensesTable.id, id)))
        .then(res => res[0]);

    if(!expense) {
        return c.notFound();
    }
    return c.json(expense)
})

.delete("/:id{[0-9]+}", getUser, async (c) => {
    const id = Number.parseInt(c.req.param("id"));

    const user = c.var['user'];
    const expense = await db
        .delete(expensesTable)
        .where(and(eq(expensesTable.userId, user.id), eq(expensesTable.id, id)))
        .returning()
        .then(res => res[0]);

    if(!expense) {
        return c.notFound();
    }

    return c.json({expense: expense});
});
