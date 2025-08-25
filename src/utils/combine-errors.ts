type ErrorInput =
  | { message: string }
  | { error: { message: string }; label: string };

export const combineErrors = (
  errors: ErrorInput[]
): { message: string } | undefined => {
  if (errors.length === 0) {
    return undefined;
  }
  return {
    message: errors
      .map((error) => {
        if ("label" in error) {
          return `${error.label}: ${error.error.message}`;
        }
        return error.message;
      })
      .join(", "),
  };
};
