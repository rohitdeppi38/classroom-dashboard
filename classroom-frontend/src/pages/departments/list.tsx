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
import { Department } from "@/types";

const DepartmentsList = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const searchFilters = searchQuery ? [
        { field: 'name', operator: 'contains' as const, value: searchQuery }
    ] : [];

    const columns = useMemo<ColumnDef<Department>[]>(() => [
        {
            id: 'code',
            accessorKey: 'code',
            size: 100,
            header: () => <p className="column-title ml-2">Code</p>,
            cell: ({ getValue }) => <Badge className="ml-2">{getValue<string>()}</Badge>
        },
        {
            id: 'name',
            accessorKey: 'name',
            size: 200,
            header: () => <p className="column-title">Name</p>,
            cell: ({ getValue }) => <span className="text-foreground font-medium">{getValue<string>()}</span>,
        },
        {
            id: 'description',
            accessorKey: 'description',
            size: 300,
            header: () => <p className="column-title">Description</p>,
            cell: ({ getValue }) => <span className="truncate">{getValue<string>()}</span>
        },
        {
            id: 'actions',
            size: 150,
            header: () => <p className="column-title">Actions</p>,
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <ShowButton resource="departments" recordItemId={row.original.id} size="sm" />
                    <EditButton resource="departments" recordItemId={row.original.id} size="sm" />
                    <DeleteButton resource="departments" recordItemId={row.original.id} size="sm" />
                </div>
            )
        }
    ], []);

    const table = useTable<Department>({
        columns,
        refineCoreProps: {
            resource: 'departments',
            pagination: { pageSize: 10, mode: 'server' },
            filters: {
                permanent: [...searchFilters]
            },
            sorters: {
                initial: [
                    { field: 'id', order: 'desc' }
                ]
            }
        }
    });

    return (
        <ListView>
            <Breadcrumb />

            <h1 className="page-title">Departments</h1>

            <div className="intro-row">
                <p>Manage the different academic departments.</p>

                <div className="actions-row">
                    <div className="search-field">
                        <Search className="search-icon" />

                        <Input
                            type="text"
                            placeholder="Search by name or code..."
                            className="pl-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <CreateButton resource="departments" />
                    </div>
                </div>
            </div>

            <DataTable table={table} />
        </ListView>
    )
}

export default DepartmentsList;
