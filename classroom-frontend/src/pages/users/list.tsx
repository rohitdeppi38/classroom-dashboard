import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { useMemo, useState } from "react";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/types";

const UsersList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");

    const searchFilters = searchQuery ? [
        { field: 'name', operator: 'contains' as const, value: searchQuery }
    ] : [];

    const roleFilters = selectedRole === 'all' ? [] : [
        { field: 'role', operator: 'eq' as const, value: selectedRole }
    ];

    const columns = useMemo<ColumnDef<User>[]>(() => [
        {
            id: 'name',
            accessorKey: 'name',
            size: 200,
            header: () => <p className="column-title ml-2">Name</p>,
            cell: ({ getValue }) => <span className="text-foreground font-medium ml-2">{getValue<string>()}</span>,
        },
        {
            id: 'email',
            accessorKey: 'email',
            size: 250,
            header: () => <p className="column-title">Email</p>,
            cell: ({ getValue }) => <span className="text-foreground">{getValue<string>()}</span>,
        },
        {
            id: 'role',
            accessorKey: 'role',
            size: 150,
            header: () => <p className="column-title">Role</p>,
            cell: ({ getValue }) => {
                const role = getValue<string>();
                return (
                    <Badge variant={role === 'admin' ? 'destructive' : role === 'teacher' ? 'default' : 'secondary'}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                )
            }
        },
        {
            id: 'actions',
            size: 150,
            header: () => <p className="column-title">Actions</p>,
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <ShowButton resource="users" recordItemId={row.original.id} size="sm" />
                    <EditButton resource="users" recordItemId={row.original.id} size="sm" />
                    <DeleteButton resource="users" recordItemId={row.original.id} size="sm" />
                </div>
            )
        }
    ], []);

    const table = useTable<User>({
        columns,
        refineCoreProps: {
            resource: 'users',
            pagination: { pageSize: 10, mode: 'server' },
            filters: {
                permanent: [...searchFilters, ...roleFilters]
            },
            sorters: {
                initial: [
                    { field: 'createdAt', order: 'desc' }
                ]
            }
        }
    });

    return (
        <ListView>
            <Breadcrumb />

            <h1 className="page-title">Users</h1>

            <div className="intro-row">
                <p>Manage admins, teachers, and students in the system.</p>

                <div className="actions-row">
                    <div className="search-field">
                        <Search className="search-icon" />

                        <Input
                            type="text"
                            placeholder="Search by name or email..."
                            className="pl-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                            </SelectContent>
                        </Select>

                        <CreateButton resource="users" />
                    </div>
                </div>
            </div>

            <DataTable table={table} />
        </ListView>
    )
}

export default UsersList;
