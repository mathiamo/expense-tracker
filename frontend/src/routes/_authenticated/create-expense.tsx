import {createFileRoute, useNavigate} from '@tanstack/react-router'
import {Input} from "../../components/ui/input"
import {Label} from "../../components/ui/label"
import {Button} from "../../components/ui/button.tsx";
import { Calendar } from "../../components/ui/calendar"
import {FieldMeta, useForm} from "@tanstack/react-form";
import {createExpense, getAllExpensesQueryOptions, loadingCreateExpenseQueryOptions} from "../../lib/api.ts";
import { zodValidator } from '@tanstack/zod-form-adapter'

import { createExpenseSchema } from "../../../../server/sharedTypes.ts";
import {FC} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";

export const Route = createFileRoute('/_authenticated/create-expense')({
    component: CreateExpense,
})
function CreateExpense() {
    const queryClient = useQueryClient();
    const navigate = useNavigate()

    const form = useForm({
        validatorAdapter: zodValidator(),
        defaultValues: {
            title: '',
            amount: "0",
            date: new Date().toISOString()
        },
        onSubmit: async ({ value }) => {
            const existingExpenses = await queryClient.ensureQueryData(getAllExpensesQueryOptions);

            await navigate({to: '/expenses'})

            // Loading state
            queryClient.setQueryData(loadingCreateExpenseQueryOptions.queryKey, {expense: value})

            try {

                const newExpense = await createExpense({value});
                queryClient.setQueryData(getAllExpensesQueryOptions.queryKey, ({
                    ...existingExpenses,
                    expenses: [newExpense,...existingExpenses.expenses]
                }));
                toast("Expense created", {
                    description: `Successfully created new expense: ${newExpense.id}`,
                })
                // Success state
            } catch (error) {
                toast("Error", {
                    description: "Failed to create new expense",
                })

            } finally {
                queryClient.setQueryData(loadingCreateExpenseQueryOptions.queryKey, {})
            }

        },

    });
    return (
        <div className="p-2">
            <h2 className="mb-4"> Create Expense</h2>
            <form className="flex flex-col gap-y-4 max-w-3xl m-auto" onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void form.handleSubmit()
            }}
            >
                <form.Field
                    name="title"
                    validators={{
                        onChange: createExpenseSchema.shape.title
                    }}
                    children={(field) => (
                        <div>
                            <Label htmlFor={field.name}>Title</Label>
                            <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                            <FieldError meta={field.state.meta}/>
                        </div>
                    )}
                />

                <form.Field
                    name="amount"
                    validators={{
                        onChange: createExpenseSchema.shape.amount
                    }}
                    children={(field) => (
                        <div>
                            <Label htmlFor={field.name}>Amount</Label>
                            <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                type="number"
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                            <FieldError meta={field.state.meta}/>
                        </div>
                    )}
                />

                <form.Field
                    name="date"
                    validators={{
                        onChange: createExpenseSchema.shape.date
                    }}
                    children={(field) => (
                        <div className="self-center">
                            <Calendar
                                mode="single"
                                selected={new Date(field.state.value)}
                                onSelect={(date) => field.handleChange((date ?? new Date()).toISOString())}
                                className="rounded-md border"
                            />
                            <FieldError meta={field.state.meta}/>
                        </div>
                    )}
                />
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button className="mt-4" type="submit" disabled={!canSubmit}>
                            {isSubmitting ? '...' : 'Submit'}
                        </Button>
                    )}
                />
            </form>
        </div>
    );
}


interface FieldErrorProps {
    meta: FieldMeta;
}

const FieldError: FC<FieldErrorProps> = ({meta}) => {
    if (!meta.isTouched || !meta.errors) return null;

    const errorMessages = Array.isArray(meta.errors) ? meta.errors : [meta.errors];

    return (
        <em>
            {errorMessages.map((error, index) => (
                <span key={index}>{error}</span>
            ))}
        </em>
    );
};