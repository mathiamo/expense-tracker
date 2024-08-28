import {createFileRoute} from '@tanstack/react-router'
import {userQueryOptions} from "../../lib/api.ts";
import {useQuery} from "@tanstack/react-query";
import {Avatar, AvatarFallback, AvatarImage} from "../../components/ui/avatar.tsx";
import {Button} from "../../components/ui/button.tsx";

export const Route = createFileRoute('/_authenticated/profile')({
    component: Profile,
})

function Profile() {
    const {isPending, error, data} = useQuery(userQueryOptions);
    if(isPending) return "loading"
    if(error) return "not logged in"

    return <div className="p-2">
        <div className="flex items-center gap-2">
            <Avatar>
                <AvatarImage src={data.user.picture} alt={data.user.given_name} />
                <AvatarFallback>{data.user.given_name}</AvatarFallback>
            </Avatar>
            <p>Hello {data.user.given_name} {data.user.family_name}</p>

        </div>
        <Button asChild className="my-4">
            <a href="/api/logout">Logout</a>
        </Button>
    </div>
}