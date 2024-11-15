import React from "react";
import { ServerError } from "../util/ServerError";

// Props interface for the ErrorPresenter component
interface ErrorPresenterProps {
  error: unknown; // Represents the error object
}

// ErrorPresenter component
export const ErrorPresenter: React.FunctionComponent<ErrorPresenterProps> = ({ error }) => {
  // Check the type of the error and render the appropriate error message
  if (typeof error === 'string') {
    return (
      <>{error}</>
    );
  }
  else if (error instanceof ServerError) {
    return (
      <>{error.message}</>
    );
  }
  else if (error instanceof Error) {
    return (
      <>{error.name}: {error.message}</>
    );
  }
  else {
    return (
      <>An unknown error occurred: {error}</>
    );
  }
};