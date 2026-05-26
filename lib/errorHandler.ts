import { ReactNode } from "react";
import { ErrorResponse } from "@/types";
import errorMessages from "./errorMessages";

type ShowError = (
  title: ReactNode,
  description?: string
) => void;

type HandleErrorProps = {
  error: unknown;
  showError: ShowError;
};

const getMappedMessage = (message: unknown) => {
  const text = String(message);
  return errorMessages[text] ?? text;
};

const showFieldErrors = (
  fieldErrors: Record<string, unknown>,
  showError: ShowError
) => {
  Object.values(fieldErrors).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((message) => {
        showError(getMappedMessage(message));
      });
    } else {
      showError(getMappedMessage(value));
    }
  });
};

const isErrorResponse = (
  error: unknown
): error is ErrorResponse => {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "data" in error
  );
};

export const handleError = ({
  error,
  showError,
}: HandleErrorProps) => {
  // RTK Query / API errors
  if (isErrorResponse(error)) {
    const data = error.data as Record<string, unknown>;

    if (
      data.fieldErrors &&
      typeof data.fieldErrors === "object"
    ) {
      showFieldErrors(
        data.fieldErrors as Record<string, unknown>,
        showError
      );

      return;
    }

    /**
     * Generic nested errors
     */
    Object.entries(data).forEach(([key, value]) => {
      // Skip general message
      if (Object.entries(data).length > 1 && key === "message") return;

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (
            typeof item === "object" &&
            item !== null
          ) {
            Object.values(item).forEach((innerValue) => {
              if (Array.isArray(innerValue)) {
                innerValue.forEach((msg) => {
                  showError(getMappedMessage(msg));
                });
              } else {
                showError(getMappedMessage(innerValue));
              }
            });
          } else {
            showError(getMappedMessage(item));
          }
        });
      } else if (
        typeof value === "object" &&
        value !== null
      ) {
        Object.values(value).forEach((innerValue) => {
          if (Array.isArray(innerValue)) {
            innerValue.forEach((msg) => {
              showError(getMappedMessage(msg));
            });
          } else {
            showError(getMappedMessage(innerValue));
          }
        });
      } else {
        showError(getMappedMessage(value));
      }
    });

    return;
  }

  /**
   * Axios / unexpected errors
   */
  const err = error as {
    response?: {
      status?: number;
      data?: {
        message?: string;
        error?: string;
      };
    };
  };

  const statusCode =
    err.response?.status || "DEFAULT";

  const errorMessage =
    err.response?.data?.message ||
    err.response?.data?.error ||
    statusCode;

  showError(getMappedMessage(errorMessage));
};