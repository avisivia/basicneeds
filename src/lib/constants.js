export const NEED_KEYS = ["belonging", "power", "freedom", "fun", "survival"];

export const LIKERT_OPTIONS = [
  { value: 5, label: "Always" },
  { value: 4, label: "Often" },
  { value: 3, label: "Sometimes" },
  { value: 2, label: "Rarely" },
  { value: 1, label: "Never" },
];

export const ATTENTION_THRESHOLD = 2;

export const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
};

export function dashboardPathForRole(role) {
  if (role === "student") return "/student/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/teacher/dashboard";
}
