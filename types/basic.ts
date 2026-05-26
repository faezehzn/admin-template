export interface ErrorResponse {
  status: number;
  data: {
    [key: string]: string[]; // Adjust the value type if it's more specific
  };
}