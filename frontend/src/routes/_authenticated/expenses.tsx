import {createFileRoute} from '@tanstack/react-router'
import {deleteExpense, getAllExpensesQueryOptions, loadingCreateExpenseQueryOptions} from "../../lib/api.ts";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,} from "../../components/ui/table"
import {Skeleton} from "../../components/ui/skeleton.tsx";
import {Button} from "../../components/ui/button.tsx";
import {Trash} from "lucide-react";
import {toast} from "sonner";

export const Route = createFileRoute('/_authenticated/expenses')({
    component: Expenses,
})

function Expenses() {
    const {isPending, error, data} = useQuery(getAllExpensesQueryOptions);
    const { data: loadingCreateExpense } = useQuery(loadingCreateExpenseQueryOptions)


    if (error) return 'An error has occurred: ' + error.message;
    return (
        <div className="p-2 max-w-3xl m-auto">
            <Table>
                <TableCaption>A list of all your expenses</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Id</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loadingCreateExpense?.expense && (
                        <TableRow >
                            <TableCell><Skeleton className="h-4" /></TableCell>
                            <TableCell>{loadingCreateExpense?.expense.title}</TableCell>
                            <TableCell>{loadingCreateExpense?.expense.amount}</TableCell>
                            <TableCell>{loadingCreateExpense?.expense.date}</TableCell>
                            <TableCell><Skeleton className="h-4" /></TableCell>
                        </TableRow>
                    )}

                    { isPending
                        ?  <TableSkeleton />:
                    data?.expenses.map((expense) => (
                        <TableRow key={expense.id}>
                            <TableCell>{expense.id}</TableCell>
                            <TableCell>{expense.title}</TableCell>
                            <TableCell>{expense.amount}</TableCell>
                            <TableCell>{expense.date}</TableCell>
                            <TableCell>
                                <ExpenseDeleteButton id={expense.id}/>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>

            </Table>
        </div>
    );
}

const TableSkeleton = () => {
    return (
        Array(3).fill(0).map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-4"/></TableCell>
                <TableCell><Skeleton className="h-4"/></TableCell>
                <TableCell><Skeleton className="h-4 "/></TableCell>
                <TableCell><Skeleton className="h-4 "/></TableCell>
            </TableRow>
        ))
    )
}

function ExpenseDeleteButton({id}: {id: number}) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: deleteExpense,
        onError: () => {
            toast("Error", {
                description: `Failed to delete expense: ${id}`
            });
        },
        onSuccess: () => {

            toast("Expense deleted", {
                description: `Successfully deleted expense: ${id}`
            });

            queryClient.setQueryData(
                getAllExpensesQueryOptions.queryKey, (existingExpenses) => ({
                ...existingExpenses,
                expenses: existingExpenses!.expenses.filter((e) => e.id !== id)
            }));
        },
    })
return (
    <Button
        disabled={mutation.isPending}
        onClick={() => mutation.mutate({id})}
        variant="outline"
        size="icon"
    >
        {mutation.isPending ? "..." : <Trash className="h4 w-4" />}
    </Button>
)
}

