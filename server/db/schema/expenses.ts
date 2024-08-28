import {text, pgTable, serial, index, numeric, timestamp, date} from 'drizzle-orm/pg-core';

import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import {z} from "zod";
export const expenses = pgTable(
'expenses',
    {
        id: serial('id').primaryKey(),
        userId: text('user_id').notNull(),
        title: text('title').notNull(),
        amount: numeric("amount", {precision: 12, scale: 2}).notNull(),
        expenseGroup: text('expense_group'),
        date: date("date").notNull(),
        createdAt: timestamp('created_at').defaultNow(),
    }, (expenses) => {
        return {
            userIdIndex: index('name_idx').on(expenses.userId),
        };
});



// Schema for inserting a expenses - can be used to validate API requests
export const insertExpensesSchema = createInsertSchema(expenses, {
    title: z.string()
        .min(3, {message: 'Title must be at least 3 characters'}),
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, {message: 'Amount must be a positive number'})
});
// Schema for selecting a expenses - can be used to validate API responses
export const selectExpensesSchema = createSelectSchema(expenses);