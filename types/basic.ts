export interface ErrorResponse {
  status: number;
  data: {
    [key: string]: string[]; // Adjust the value type if it's more specific
  };
}

export type ListArgsAPI<T> = {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: T;
  sortDir?: "asc" | "desc";
};

export type ModelPrismaResponse<T> = {
  items: T[];
  meta: { page: number; pageSize: number; total: number; pageCount: number };
};