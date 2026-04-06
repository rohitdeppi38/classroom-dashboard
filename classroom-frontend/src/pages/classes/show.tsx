import { AdvancedImage } from "@cloudinary/react";
import { useShow, useCustomMutation, useList, useInvalidate } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useParams } from "react-router";

import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import {
  ShowView,
  ShowViewHeader,
} from "@/components/refine-ui/views/show-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bannerPhoto } from "@/lib/cloudinary";
import { ClassDetails, User } from "@/types";
import { Loader2 } from "lucide-react";

type EnrollmentRecord = {
  id: number;
  studentId: string;
  classId: number;
  student: User;
};

const ClassesShow = () => {
  const { id } = useParams();
  const classId = id ?? "";

  const { query } = useShow<ClassDetails>({
    resource: "classes",
  });

  const classDetails = query.data?.data;
  
  const invalidate = useInvalidate();

  const { mutate, mutation } = useCustomMutation();
  const isEnrolling = mutation?.isLoading || mutation?.isPending;

  const [selectedStudent, setSelectedStudent] = useState<string>("");

  const { query: studentsQuery } = useList<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: "student" }],
    pagination: { pageSize: 100 },
  });

  const unenrollMutation = useCustomMutation();

  const handleEnroll = () => {
    if (!selectedStudent) return;
    mutate(
      {
        url: `classes/${classId}/enroll`,
        method: "post",
        values: { studentId: selectedStudent },
      },
      {
        onSuccess: () => {
          setSelectedStudent("");
          invalidate({ resource: `classes/${classId}/enroll`, invalidates: ["list"] });
          invalidate({ resource: "classes", invalidates: ["detail"] }); // refresh capacity maybe
        },
      }
    );
  };

  const handleUnenroll = (studentId: string) => {
    unenrollMutation.mutate(
      {
        url: `classes/${classId}/enroll/${studentId}`,
        method: "delete",
        values: {}
      },
      {
         onSuccess: () => {
             invalidate({ resource: `classes/${classId}/enroll`, invalidates: ["list"] });
         }
      }
    )
  }

  const studentColumns = useMemo<ColumnDef<EnrollmentRecord>[]>(
    () => [
      {
        id: "name",
        accessorKey: "student.name",
        size: 240,
        header: () => <p className="column-title">Student</p>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              {row.original.student?.image && (
                <AvatarImage src={row.original.student.image} alt={row.original.student?.name} />
              )}
              <AvatarFallback>{getInitials(row.original.student?.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="truncate">{row.original.student?.name}</span>
              <span className="text-xs text-muted-foreground truncate">
                {row.original.student?.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "actions",
        size: 140,
        header: () => <p className="column-title">Actions</p>,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <ShowButton
                resource="users"
                recordItemId={row.original.student?.id}
                variant="outline"
                size="sm"
            >
                View
            </ShowButton>
            <Button variant="destructive" size="sm" onClick={() => handleUnenroll(row.original.studentId)}>Remove</Button>
          </div>
        ),
      },
    ],
    []
  );

  const studentsTable = useTable<EnrollmentRecord>({
    columns: studentColumns,
    refineCoreProps: {
      resource: `classes/${classId}/enroll`,
      pagination: {
        pageSize: 10,
        mode: "server",
      },
    },
  });

  if (query.isLoading || query.isError || !classDetails) {
    return (
      <ShowView className="class-view class-show">
        <ShowViewHeader resource="classes" title="Class Details" />
        <p className="state-message">
          {query.isLoading
            ? "Loading class details..."
            : query.isError
            ? "Failed to load class details."
            : "Class details not found."}
        </p>
      </ShowView>
    );
  }

  const teacherName = classDetails.teacher?.name ?? "Unknown";
  const teacherInitials = teacherName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const placeholderUrl = `https://placehold.co/600x400?text=${encodeURIComponent(
    teacherInitials || "NA"
  )}`;
  
  // Calculate enrollments count dynamically from table? 
  // It should be fetched properly, but for now we look at studentsTable data
  const enrollmentsCount = (studentsTable as any).options?.data?.length || 0;
  const isAtCapacity = enrollmentsCount >= classDetails.capacity;

  return (
    <ShowView className="class-view class-show space-y-6">
      <ShowViewHeader resource="classes" title="Class Details" />

      <div className="banner">
        {classDetails.bannerUrl ? (
          classDetails.bannerUrl.includes("res.cloudinary.com") &&
          classDetails.bannerCldPubId ? (
            <AdvancedImage
              cldImg={bannerPhoto(
                classDetails.bannerCldPubId ?? "",
                classDetails.name
              )}
              alt="Class Banner"
            />
          ) : (
            <img
              src={classDetails.bannerUrl}
              alt={classDetails.name}
              loading="lazy"
            />
          )
        ) : (
          <div className="placeholder" />
        )}
      </div>

      <Card className="details-card">
        {/* Class Details */}
        <div>
          <div className="details-header">
            <div>
              <h1 className="flex items-center gap-3">{classDetails.name} <Badge variant="outline">Invite Code: {classDetails.inviteCode}</Badge></h1>
              <p>{classDetails.description}</p>
            </div>

            <div>
              <Badge variant={isAtCapacity ? "destructive" : "outline"}>
                {enrollmentsCount} / {classDetails.capacity} spots
              </Badge>
              <Badge
                variant={
                  classDetails.status === "active" ? "default" : "secondary"
                }
                data-status={classDetails.status}
              >
                {classDetails.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="details-grid mt-4">
            <div className="instructor">
              <p className="font-semibold text-muted-foreground mb-2 flex items-center gap-2"><span className="text-xl">👨‍🏫</span> Instructor</p>
              <div className="flex items-center gap-3 bg-secondary/20 p-3 rounded-lg border">
                <img
                  src={classDetails.teacher?.image ?? placeholderUrl}
                  alt={teacherName}
                  className="w-10 h-10 rounded-full"
                />

                <div>
                  <p className="font-medium leading-none">{teacherName}</p>
                  <p className="text-sm text-muted-foreground mt-1">{classDetails?.teacher?.email}</p>
                </div>
              </div>
            </div>

            <div className="department">
              <p className="font-semibold text-muted-foreground mb-2 flex items-center gap-2"><span className="text-xl">🏛️</span> Department</p>

              <div className="bg-secondary/20 p-3 rounded-lg border">
                <p className="font-medium">{classDetails?.department?.name}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{classDetails?.department?.description}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Subject Card */}
        <div className="subject">
          <p className="font-semibold text-muted-foreground mb-2 flex items-center gap-2"><span className="text-xl">📚</span> Subject</p>

          <div className="bg-secondary/20 p-4 rounded-lg border flex gap-4">
            <Badge variant="outline">
              {classDetails?.subject?.code}
            </Badge>
            <div>
              <p className="font-medium">{classDetails?.subject?.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{classDetails?.subject?.description}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Join Class Section */}
        <div className="join bg-primary/5 rounded-lg p-6 border border-primary/20">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><span className="text-2xl">🎓</span> Admin: Enroll Student</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="w-full">
              <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={studentsQuery.isLoading}>
                <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select a student to enroll" />
                </SelectTrigger>
                <SelectContent>
                    {studentsQuery.data?.data?.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.email})
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button size="lg" className="w-full sm:w-auto whitespace-nowrap" onClick={handleEnroll} disabled={!selectedStudent || isEnrolling || isAtCapacity}>
                {isEnrolling ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                {isAtCapacity ? "Class Full" : "Enroll Student"}
            </Button>
          </div>
          {isAtCapacity && (
              <p className="text-destructive text-sm mt-2 font-medium">Cannot enroll more students, class capacity reached.</p>
          )}
        </div>

      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Enrolled Students</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable table={studentsTable} />
        </CardContent>
      </Card>
    </ShowView>
  );
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return `${parts[0][0] ?? ""}${
    parts[parts.length - 1][0] ?? ""
  }`.toUpperCase();
};

export default ClassesShow;