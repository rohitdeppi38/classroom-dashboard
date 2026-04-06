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
import { useBack, useParsed } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import { departmentSchema } from "@/lib/schema";
import z from "zod";

const DepartmentsEdit = () => {
  const back = useBack();
  const { id } = useParsed();

  const form = useForm({
    resolver: zodResolver(departmentSchema),
    refineCoreProps: {
      resource: "departments",
      action: "edit",
      id,
    },
  });

  const {
    refineCore: { onFinish, query },
    handleSubmit,
    formState: { isSubmitting },
    control,
  } = form;

  const isLoading = query?.isLoading;

  const onSubmit = async (values: z.infer<typeof departmentSchema>) => {
    try {
      await onFinish(values);
    } catch (error) {
      console.error("Error updating department:", error);
    }
  };

  if (isLoading) {
      return <div>Loading...</div>;
  }

  return (
    <EditView>
      <Breadcrumb />

      <h1 className="page-title">Edit Department</h1>
      <div className="intro-row">
        <p>Modify department information below.</p>
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
                        Department Name <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Engineering" {...field} />
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
                        Department Code <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="ENG" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
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
                    "Update Department"
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

export default DepartmentsEdit;
