import dynamic from "next/dynamic";

import { ServerError } from "src/components/server-error";
const ApplicationLayout = dynamic(
  () => import("../components/app-layout").then((mod) => mod.ApplicationLayout),
  { ssr: false }
);

const ErrorPage = () => {
  return (
    <ApplicationLayout errorState>
      <ServerError />
    </ApplicationLayout>
  );
};

export default ErrorPage;
