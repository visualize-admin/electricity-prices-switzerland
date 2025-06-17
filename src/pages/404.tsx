import dynamic from "next/dynamic";

import { NotFound } from "src/components/not-found";
const ApplicationLayout = dynamic(
  () => import("../components/app-layout").then((mod) => mod.ApplicationLayout),
  { ssr: false }
);

const ErrorPage = () => {
  return (
    <ApplicationLayout errorState>
      <NotFound />
    </ApplicationLayout>
  );
};

export default ErrorPage;
