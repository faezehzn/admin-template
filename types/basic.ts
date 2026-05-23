export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
};
export type Role = {
  id: number;
  name: string;
  users: number;
};
