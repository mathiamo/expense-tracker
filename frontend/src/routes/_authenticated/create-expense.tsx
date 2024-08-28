import {createFileRoute, useNavigate} from '@tanstack/react-router'
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {FieldMeta, useForm, } from "@tanstack/react-form";
import {createExpense, getAllExpensesQueryOptions, loadingCreateExpenseQueryOptions} from "@/lib/api.ts";
import {zodValidator} from '@tanstack/zod-form-adapter'

import {createExpenseSchema} from "@server/sharedTypes.ts";
import {FC} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import { ChevronsUpDown } from "lucide-react"

import {cn} from "@/lib/utils.ts";

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
            expenseGroup: '',
            date: new Date().toISOString()
        },
        onSubmit: async ({value}) => {
            const existingExpenses = await queryClient.ensureQueryData(getAllExpensesQueryOptions);

            await navigate({to: '/expenses'})

            // Loading state
            queryClient.setQueryData(loadingCreateExpenseQueryOptions.queryKey, {expense: value})

            try {

                const newExpense = await createExpense({value});
                queryClient.setQueryData(getAllExpensesQueryOptions.queryKey, ({
                    ...existingExpenses,
                    expenses: [newExpense, ...existingExpenses.expenses]
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
                        <FormField field={field} label="Title" type="text" />
                    )}
                />

                <form.Field
                    name="amount"
                    validators={{
                        onChange: createExpenseSchema.shape.amount
                    }}
                    children={(field) => (
                        <FormField field={field} label="Amount" type="number" />
                    )}
                />

                <form.Field
                    name="expenseGroup"
                    validators={{
                        onChange: createExpenseSchema.shape.expenseGroup
                    }}
                    children={(field) => (
                            <>
                            <Label>Expense type</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-[200px] justify-between",
                                                    !field.name && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? expenseTypes.find(
                                                        (type) => type.value === field.value
                                                    )?.label
                                                    : "Select expense group"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search expense group..." />
                                            <CommandList>
                                                <CommandEmpty>No expense group found.</CommandEmpty>
                                                <CommandGroup>
                                                    {expenseTypes.map((expenseType) => (
                                                        <CommandItem
                                                            value={expenseType.label}
                                                            key={expenseType.value}
                                                            onSelect={() => {
                                                                field.handleChange(expenseType.value);
                                                            }}

                                                        >
                                                            {expenseType.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </>
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

const FormField: FC<{ field: any, label: string, type: string }> = ({field, label, type}) => (
    <div>
        <Label htmlFor={field.name}>{label}</Label>
        <Input
            id={field.name}
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            type={type}
            onChange={(e) => field.handleChange(e.target.value)}
        />
        <FieldError meta={field.state.meta}/>
    </div>
)


const expenseTypes = [
    {
        value: "matvarer",
        label: "Matvarer",
    },
    {
        value: "bil",
        label: "Bil",
    },
    {
        value: "streaming",
        label: "Streaming",
    },
    {
        value: "klarBarn",
        label: "Klær barn",
    },
    {
        value: "reiser",
        label: "Reiser",
    },
]

