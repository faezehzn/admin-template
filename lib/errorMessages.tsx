import { ReactNode } from "react";

const errorMessages: Record<string | number, string | ReactNode> = {
  /**
   * HTTP Errors
   */
  400: "Invalid request. Please check your input.",
  401: "You are not authenticated. Please sign in.",
  403: "You do not have permission to access this resource.",
  404: "The requested resource was not found.",
  409: "This record already exists.",
  422: "Validation failed. Please review your input.",
  500: "An internal server error occurred. Please try again later.",

  /**
   * App / Network Errors
   */
  NETWORK_ERROR:
    "A network error occurred. Please check your internet connection.",

  VALIDATION_ERROR:
    "Some fields contain invalid data. Please review and try again.",

  DEFAULT: "Something went wrong. Please try again.",
};

export default errorMessages;
