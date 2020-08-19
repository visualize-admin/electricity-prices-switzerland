import * as React from "react";

/**
 * This component attaches a classname to a div.
 * It is waited for in the screenshot function,
 * in order to ensure that observations are loaded.
 */
export const WithClassName = ({
  downloadId,
  children,
}: {
  downloadId: string;
  children: React.ReactNode;
}) => <div className={downloadId}>{children}</div>;
