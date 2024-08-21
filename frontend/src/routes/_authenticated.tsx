// src/routes/_authenticated.tsx
import {createFileRoute, Outlet, redirect} from "@tanstack/react-router";
import { userQueryOptions } from "../lib/api.ts";
import {Button} from "../components/ui/button.tsx";


const Login = () => {
    return (
        <div className="flex flex-col gap-y-2 items-center">
            <p>Yu have to login or register</p>
            <Button asChild>
                <a href="/api/login">Login</a>
            </Button>
            <Button asChild>
                <a href="/api/register">register</a>
            </Button>
        </div>
    )
}

const Component = () => {
    const { user } = Route.useRouteContext();
    if(!user) {
        return <Login />
    }

    return <Outlet/>
}
export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async ({ context }) => {
        const queryClient = context.queryClient

        try {
            const data = await queryClient.fetchQuery(userQueryOptions);
            return data;
        } catch (e) {
            return {user: null};
        }

    },
    component: Component,
})

