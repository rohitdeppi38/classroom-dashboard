import { useShow } from "@refinedev/core";
import { ShowView } from "@/components/refine-ui/views/show-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User } from "@/types";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { Badge } from "@/components/ui/badge";

const UsersShow = () => {
    const { query } = useShow<User>({
        resource: "users",
    });

    const { data, isLoading } = query;
    const user = data?.data;

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <ShowView>
            <Breadcrumb />

            <div className="flex justify-between items-center mb-6">
                <h1 className="page-title mb-0">User Details</h1>
                <EditButton resource="users" recordItemId={user.id} />
            </div>

            <Card className="w-full max-w-3xl">
                <CardHeader className="flex flex-row items-center gap-4">
                    {user.image ? (
                        <img src={user.image} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                            {user.name}
                            <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'teacher' ? 'default' : 'secondary'}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                        </CardTitle>
                        <div className="text-muted-foreground mt-1">{user.email}</div>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold text-sm text-muted-foreground mb-1">Joined</h3>
                            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-muted-foreground mb-1">ID</h3>
                            <p className="text-sm font-mono">{user.id}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </ShowView>
    );
};

export default UsersShow;
