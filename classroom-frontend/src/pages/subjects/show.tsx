import { useShow } from "@refinedev/core";
import { ShowView } from "@/components/refine-ui/views/show-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Subject } from "@/types";
import { EditButton } from "@/components/refine-ui/buttons/edit";

const SubjectsShow = () => {
    const { query } = useShow<Subject>({
        resource: "subjects",
    });

    const { data, isLoading } = query;
    const subject = data?.data;

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!subject) {
        return <div>Subject not found</div>;
    }

    return (
        <ShowView>
            <Breadcrumb />

            <div className="flex justify-between items-center mb-6">
                <h1 className="page-title mb-0">Subject Details</h1>
                <EditButton resource="subjects" recordItemId={subject.id} />
            </div>

            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">{subject.name}</CardTitle>
                    <div className="text-muted-foreground mt-1">Code: {subject.code}</div>
                    {subject.department && (
                        <div className="text-sm mt-2 text-primary font-medium">Department: {(subject.department as any).name || subject.department}</div>
                    )}
                </CardHeader>
                <Separator />
                <CardContent className="mt-6 space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg">Description</h3>
                        <p>{subject.description || "No description provided."}</p>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Created At</h4>
                                <p>{subject.created_at ? new Date(subject.created_at).toLocaleString() : 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Updated At</h4>
                                <p>{subject.updated_at ? new Date(subject.updated_at).toLocaleString() : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </ShowView>
    );
};

export default SubjectsShow;
