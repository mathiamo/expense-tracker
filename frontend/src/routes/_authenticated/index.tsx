import {createFileRoute} from '@tanstack/react-router'

import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "../../components/ui/card.tsx"
import {api} from "../../lib/api.ts";
import {useQuery} from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/")({
    component: Index,
})

async function getTotalSpent() {
    const res = await api.expenses["total-spent"].$get()
    if(!res.ok) {
        throw new Error("server error")
    }
    return await res.json();
}
function Index() {
    const { isPending, error, data }  = useQuery({
        queryKey: ['get-total-spent'],
        queryFn: getTotalSpent,
    });


    if (error) return 'An error has occurred: ' + error.message;

    return (
        <>
            <Card className="w-[350px] mx-auto">
                <CardHeader>
                    <CardTitle>Total spent</CardTitle>
                    <CardDescription>Total amount spent</CardDescription>
                </CardHeader>
                <CardContent>
                    {isPending ? "..." : data.total}
                </CardContent>
            </Card>

        </>
    )
}
