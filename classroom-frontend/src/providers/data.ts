import {BaseRecord, DataProvider,GetListParams,GetListResponse } from "@refinedev/core";

export interface Subject extends BaseRecord {
  id: string | number;
  code: string;
  name: string;
  department: string;
  description: string;
}

export const mockSubjects: Subject[] = [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Computer Science",
    department: "Computer Science",
    description: "A foundational course covering basic programming concepts, algorithms, and data structures."
  },
  {
    id: "2",
    code: "MATH201",
    name: "Linear Algebra",
    department: "Mathematics",
    description: "An introductory course on vector spaces, matrices, linear transformations, and systems of linear equations."
  },
  {
    id: "3",
    code: "PHY105",
    name: "General Physics I",
    department: "Physics",
    description: "A calculus-based introduction to classical mechanics, including kinematics, dynamics, and thermodynamics."
  }
];

export const dataProvider:DataProvider={
  getList : async<TData extends BaseRecord = BaseRecord>({resource}:GetListParams):Promise<GetListResponse<TData>> =>{
      if(resource !== 'subjects'){
        return {
          data:[] as TData[],total:0
        }
      }

      return {
        data: mockSubjects as unknown as TData[],
        total: mockSubjects.length,
      }
    },

  getOne:async ()=>{throw new Error('This function is not present in mock') },
  create:async ()=>{throw new Error('This function is not present in mock') },
  update:async ()=>{throw new Error('This function is not present in mock') },
  deleteOne:async ()=>{throw new Error('This function is not present in mock') },

  getApiUrl:()=>'',
}