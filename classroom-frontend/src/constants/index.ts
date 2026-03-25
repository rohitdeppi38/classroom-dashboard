import { GraduationCap, School } from "lucide-react";

export const USER_ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
};

export const ROLE_OPTIONS = [
  {
    value: USER_ROLES.STUDENT,
    label: "Student",
    icon: GraduationCap,
  },
  {
    value: USER_ROLES.TEACHER,
    label: "Teacher",
    icon: School,
  },
];

export const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "Economics",
  "Business Administration",
  "Engineering",
  "Psychology",
  "Sociology",
  "Political Science",
  "Philosophy",
  "Education",
  "Fine Arts",
  "Music",
  "Physical Education",
  "Law",
] as const;

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((dept) => ({
  value: dept,
  label: dept,
}));

export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
export const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const requireEnv = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

export const CLOUDINARY_UPLOAD_URL = requireEnv(import.meta.env.VITE_CLOUDINARY_UPLOAD_URL, "VITE_CLOUDINARY_UPLOAD_URL");
export const CLOUDINARY_CLOUD_NAME = requireEnv(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME, "VITE_CLOUDINARY_CLOUD_NAME");
export const BACKEND_BASE_URL = requireEnv(import.meta.env.VITE_BACKEND_BASE_URL, "VITE_BACKEND_BASE_URL");

export const BASE_URL = requireEnv(import.meta.env.VITE_API_URL, "VITE_API_URL");
export const ACCESS_TOKEN_KEY = requireEnv(import.meta.env.VITE_ACCESS_TOKEN_KEY, "VITE_ACCESS_TOKEN_KEY");
export const REFRESH_TOKEN_KEY = requireEnv(import.meta.env.VITE_REFRESH_TOKEN_KEY, "VITE_REFRESH_TOKEN_KEY");

export const REFRESH_TOKEN_URL = `${BASE_URL}/refresh-token`;

export const CLOUDINARY_UPLOAD_PRESET = requireEnv(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET, "VITE_CLOUDINARY_UPLOAD_PRESET");