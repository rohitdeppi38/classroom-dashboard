import { useShow } from "@refinedev/core";
import { ShowView } from "@/components/refine-ui/views/show-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Department } from "@/types";
import { EditButton } from "@/components/refine-ui/buttons/edit";

const DepartmentsShow = () => {
    const { query } = useShow<Department & { _count?: { subjects: number } }>({
        resource: "departments",
    });

    const { data, isLoading } = query;
    const department = data?.data;

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!department) {
        return <div>Department not found</div>;
    }

    return (
        <ShowView>
            <Breadcrumb />

            <div className="flex justify-between items-center mb-6">
                <h1 className="page-title mb-0">Department Details</h1>
                <EditButton resource="departments" recordItemId={department.id} />
            </div>

            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">{department.name}</CardTitle>
                    <div className="text-muted-foreground">Code: {department.code}</div>
                </CardHeader>
                <Separator />
                <CardContent className="mt-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">Description</h3>
                        <p>{department.description || "No description provided."}</p>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="font-semibold text-lg mb-2">Metrics</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-secondary/20 p-4 rounded-lg border text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {department._count?.subjects ?? 0}
                                </div>
                                <div className="text-sm text-muted-foreground">Total Subjects</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </ShowView>
    );
};

export default DepartmentsShow;
