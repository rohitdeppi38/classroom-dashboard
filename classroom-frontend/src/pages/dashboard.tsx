import React from 'react';
import { useCustom } from '@refinedev/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { Users, Building2, Book, GraduationCap, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

type DashboardData = {
  overview: {
    totalUsers: number;
    totalDepartments: number;
    totalSubjects: number;
    totalClasses: number;
    totalEnrollments: number;
  };
  charts: {
    enrollmentTrends: { month: string; count: string }[];
    classesByDept: { department: string; class_count: string }[];
    userDistribution: { role: string; count: string }[];
  };
};

const Dashboard = () => {
  const { data, isLoading, isError } = useCustom<DashboardData>({
    url: "dashboard/stats",
    method: "get",
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return <div>Failed to load dashboard data.</div>;
  }

  const { overview, charts } = data.data;

  // Format data for Recharts (convert count strings to numbers)
  const trendsData = charts.enrollmentTrends.map((d) => ({
    name: d.month,
    Enrollments: parseInt(d.count, 10) || 0,
  }));

  const deptData = charts.classesByDept.map((d) => ({
    name: d.department || "Unknown",
    Classes: parseInt(d.class_count, 10) || 0,
  }));

  const userData = charts.userDistribution.map((d) => ({
    name: d.role.toUpperCase(),
    value: parseInt(d.count, 10) || 0,
  }));

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />

      <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to the Classroom Management System Overview.
      </p>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalDepartments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Subjects</CardTitle>
            <Book className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalSubjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Classes & Enrollments</CardTitle>
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.totalClasses} <span className="text-sm text-muted-foreground font-normal">/ {overview.totalEnrollments} enr.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Enrollment Trends */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Enrollment Trends (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="Enrollments" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Classes by Department */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Classes by Department</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Classes" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {userData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Extra Card for Balance */}
        <Card className="col-span-1 bg-primary/5 border-primary/20 flex flex-col justify-center items-center text-center p-6">
            <h2 className="text-2xl font-bold mb-2">Ready to expand?</h2>
            <p className="text-muted-foreground mb-6">Manage new subjects and onboard new teachers smoothly via the unified dashboards.</p>
            <div className="flex gap-4">
                <a href="/classes/create" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-sm">New Class</a>
                <a href="/users/create" className="bg-background border px-4 py-2 rounded-md font-medium shadow-sm">Add User</a>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;