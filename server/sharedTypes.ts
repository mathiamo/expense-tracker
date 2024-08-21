import {z} from "zod";
import {insertExpensesSchema} from "./db/schema/expenses.ts";


export const expenseSchema = insertExpensesSchema.omit({
    userId: true,
    createdAt: true,
    id: true,
})

export const createExpenseSchema = expenseSchema.omit({id: true})

export type CreateExpense = z.infer<typeof createExpenseSchema>;