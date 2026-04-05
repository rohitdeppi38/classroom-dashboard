import {  Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import "./App.css";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { dataProvider } from "./providers/data";

import Dashboard from "./pages/dashboard";
import { Layout } from "./components/refine-ui/layout/layout";
import { Book, BookOpen, GraduationCap, Home, Building2, UsersIcon } from "lucide-react";

import SubjectsLists from './pages/subjects/subjectsLists'
import SubjectsCreate from './pages/subjects/create'
import SubjectsEdit from './pages/subjects/edit'
import SubjectsShow from './pages/subjects/show'

import ClassesList from './pages/classes/list'
import ClassesCreate from './pages/classes/create'
import ClassesEdit from './pages/classes/edit'
import ClassesShow from './pages/classes/show'

import DepartmentsList from './pages/departments/list'
import DepartmentsCreate from './pages/departments/create'
import DepartmentsEdit from './pages/departments/edit'
import DepartmentsShow from './pages/departments/show'

import UsersList from './pages/users/list'
import UsersCreate from './pages/users/create'
import UsersEdit from './pages/users/edit'
import UsersShow from './pages/users/show'


function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "kfHkQV-ZWmCDO-61GPYM",
              }}
              resources={
                [
                  {name:'dashboard',list:'/',meta:{label:'Home',icon:<Home/>}},
                  {name:'departments',list:'/departments',create:'/departments/create',edit:'/departments/edit/:id',show:"/departments/show/:id",meta:{label:'Departments',icon:<Building2/>}},
                  {name:'users',list:'/users',create:'/users/create',edit:'/users/edit/:id',show:"/users/show/:id",meta:{label:'Users',icon:<UsersIcon/>}},
                  {name:'subjects',list:'/subjects',create:'/subjects/create',edit:'/subjects/edit/:id',show:"/subjects/show/:id",meta:{label:'Subjects',icon:<Book/>}},
                  {name:'classes',list:'/classes',create:'/classes/create',edit:'/classes/edit/:id',show:"/classes/show/:id",meta:{label:'Classes',icon:<GraduationCap/>}}
                ]
              }
            >
              <Routes>
                <Route element={
                  <Layout>
                    <Outlet/>
                  </Layout>
                }>
                  <Route path="/" element={<Dashboard/>} />
                  <Route path="departments">
                    <Route index element={<DepartmentsList/>}/>
                    <Route path="create" element={<DepartmentsCreate/>}/>
                    <Route path="edit/:id" element={<DepartmentsEdit/>}/>
                    <Route path="show/:id" element={<DepartmentsShow/>}/>
                  </Route>
                  <Route path="users">
                    <Route index element={<UsersList/>}/>
                    <Route path="create" element={<UsersCreate/>}/>
                    <Route path="edit/:id" element={<UsersEdit/>}/>
                    <Route path="show/:id" element={<UsersShow/>}/>
                  </Route>
                  <Route path="subjects">
                    <Route index element={<SubjectsLists/>}/>
                    <Route path="create" element={<SubjectsCreate/>}/>
                    <Route path="edit/:id" element={<SubjectsEdit/>}/>
                    <Route path="show/:id" element={<SubjectsShow/>}/>
                  </Route>
                  <Route path="classes">
                    <Route index element={<ClassesList/>}/>
                    <Route path="create" element={<ClassesCreate/>}/>
                    <Route path="edit/:id" element={<ClassesEdit/>}/>
                    <Route path="show/:id" element={<ClassesShow/>}/>
                  </Route>
                </Route>
              </Routes>
              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
