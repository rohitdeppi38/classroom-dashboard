import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { ListView } from '@/components/refine-ui/views/list-view';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Select, SelectItem } from '@/components/ui/select';
import { CreateButton } from '@/components/refine-ui/buttons/create';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { useTable } from '@refinedev/react-table';
import { useList } from '@refinedev/core';
import { Subject, User, ClassDetails } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { ShowButton } from '@/components/refine-ui/buttons/show';

const ClassesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState("all");

  const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: { pageSize: 100 },
  });

  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "teacher",
      },
    ],
    pagination: { pageSize: 100 },
  });

  const subjects = subjectsQuery.data?.data || [];
  const teachers = teachersQuery.data?.data || [];

  const subjectFilters = selectedSubject === 'all' ? [] : [
    { field: 'subject', operator: 'eq' as const, value: selectedSubject }
  ];

  const teacherFilters = selectedTeacher === 'all' ? [] : [
    { field: 'teacher', operator: 'eq' as const, value: selectedTeacher }
  ];

  const searchFilters = searchQuery ? [
    { field: 'name', operator: 'contains' as const, value: searchQuery }
  ] : [];

  const classTable = useTable<ClassDetails>({
    columns: React.useMemo<ColumnDef<ClassDetails>[]>(() => [
      {
        id: 'bannerUrl',
        accessorKey: 'bannerUrl',
        size: 80,
        header: () => <p className='column-title ml-2'>Banner</p>,
        cell: ({ getValue }: any) => {
          const url = getValue() as string;
          return url ? (
            <img src={url} alt="Banner" className="w-10 h-10 rounded object-cover ml-2" />
          ) : (
            <div className="w-10 h-10 rounded bg-muted ml-2" />
          );
        }
      },
      {
        id: 'name',
        accessorKey: 'name',
        size: 200,
        header: () => <p className='column-title'>Name</p>,
        cell: ({ getValue }: any) => <span className='text-foreground'>{getValue() as string}</span>,
        filterFn: 'includesString',
      },
      {
        id: 'status',
        accessorKey: 'status',
        size: 100,
        header: () => <p className='column-title'>Status</p>,
        cell: ({ getValue }: any) => {
          const status = getValue() as string;
          return (
            <Badge variant={status === 'active' ? 'default' : 'secondary'} className='capitalize'>
              {status}
            </Badge>
          );
        }
      },
      {
        id: 'subject',
        accessorKey: 'subject.name',
        size: 150,
        header: () => <p className='column-title'>Subject</p>,
        cell: ({ getValue }: any) => <Badge variant="secondary">{getValue() as string}</Badge>
      },
      {
        id: 'teacher',
        accessorKey: 'teacher.name',
        size: 150,
        header: () => <p className='column-title'>Teacher</p>,
        cell: ({ getValue }: any) => <span className='text-foreground'>{getValue<string>()}</span>
      },
      {
        id: 'capacity',
        accessorKey: 'capacity',
        size: 100,
        header: () => <p className='column-title'>Capacity</p>,
        cell: ({ getValue }: any) => <span>{getValue() as number}</span>
      },{
        id:'details',
        accessorKey:'details',
        size:140,
        header:()=><p className='column-title'>Details</p>,
        cell:({row})=><ShowButton resource='classes' recordItemId={row.original.id} variant='outline' size="sm">View</ShowButton>
      }
    ], []),
    refineCoreProps: {
      resource: 'classes',
      pagination: { pageSize: 10, mode: 'server' },
      filters: {
        permanent: [...subjectFilters, ...teacherFilters, ...searchFilters]
      },
      sorters: {
        initial: [
          {
            field: 'id',
            order: 'desc'
          }
        ]
      }
    }
  });

  return (
    <ListView>
      <Breadcrumb />

      <h1 className='page-title'>Classes</h1>

      <div className='intro-row'>
        <p>Manage and organize your classes.</p>

        <div className='actions-row'>
          <div className='search-field'>
            <Search className='search-icon' />

            <Input
              type='text'
              placeholder="Search by class name..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className='flex gap-2 w-full sm:w-auto overflow-x-auto'>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Subjects</SelectItem>
                {subjects.map((subject: Subject) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Teachers</SelectItem>
                {teachers.map((teacher: User) => (
                  <SelectItem key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <CreateButton resource="classes" />
          </div>
        </div>
      </div>

      <DataTable table={classTable} />

    </ListView>
  );
}

export default ClassesList;