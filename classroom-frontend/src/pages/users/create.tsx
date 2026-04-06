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
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { useBack } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import { userSchema } from "@/lib/schema";
import z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UsersCreate = () => {
  const back = useBack();

  const form = useForm({
    resolver: zodResolver(userSchema),
    refineCoreProps: {
      resource: "users",
      action: "create",
    },
    defaultValues: {
      role: "student"
    }
  });

  const {
    refineCore: { onFinish },
    handleSubmit,
    formState: { isSubmitting },
    control,
  } = form;

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    try {
      await onFinish(values);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <CreateView>
      <Breadcrumb />

      <h1 className="page-title">Create a User</h1>
      <div className="intro-row">
        <p>Provide the required information to add a user.</p>
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
                        Name <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                    control={control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Role <span className="text-orange-600">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <Separator />

                <Button type="submit" size="lg" className="w-full">
                  {isSubmitting ? (
                    <div className="flex gap-1">
                      <span>Creating...</span>
                      <Loader2 className="inline-block ml-2 animate-spin" />
                    </div>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </CreateView>
  );
};

export default UsersCreate;
