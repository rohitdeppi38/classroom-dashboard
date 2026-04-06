import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EditView } from "@/components/refine-ui/views/edit-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Textarea } from "@/components/ui/textarea";
import { useBack, useList } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import { subjectSchema } from "@/lib/schema";
import z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Department } from "@/types";

const SubjectsEdit = () => {
  const back = useBack();

  const form = useForm({
    resolver: zodResolver(subjectSchema),
    refineCoreProps: {
      resource: "subjects",
      action: "edit",
    },
  });

  const {
    refineCore: { onFinish, query },
    handleSubmit,
    formState: { isSubmitting },
    control,
  } = form;

  const isLoading = query?.isLoading;

  const { query: deptQuery } = useList<Department>({
    resource: "departments",
    pagination: { pageSize: 100 },
  });

  const departments = deptQuery.data?.data || [];
  const deptLoading = deptQuery.isLoading;

  const onSubmit = async (values: z.infer<typeof subjectSchema>) => {
    try {
      await onFinish({
        name: values.name,
        code: values.code,
        description: values.description,
        departmentId: Number(values.department)
      });
    } catch (error) {
      console.error("Error updating subject:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <EditView>
      <Breadcrumb />

      <h1 className="page-title">Edit Subject</h1>
      <div className="intro-row">
        <p>Modify subject information below.</p>
        <Button onClick={() => back()}>Go Back</Button>
      </div>

      <Separator />

      <div className="my-4 flex items-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl pb-0 font-bold">
              Fill out form
            </CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="mt-7">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Subject Name <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Mathematics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Subject Code <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="MATH101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Department <span className="text-orange-600">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value?.toString()}
                        disabled={deptLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem
                              key={dept.id}
                              value={dept.id.toString()}
                            >
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Description <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <Button type="submit" size="lg" className="w-full">
                  {isSubmitting ? (
                    <div className="flex gap-1">
                      <span>Updating...</span>
                      <Loader2 className="inline-block ml-2 animate-spin" />
                    </div>
                  ) : (
                    "Update Subject"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </EditView>
  );
};

export default SubjectsEdit;
