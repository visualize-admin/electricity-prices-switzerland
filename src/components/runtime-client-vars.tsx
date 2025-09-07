// Is used in _document to populate environment variables.

import { getRuntimeServerSideEnvVariables, scriptId } from "src/env/runtime";

// This component is server-side rendered and has access to process.env variables
const RuntimeClientVarsScript = () => {
  return (
    <script
      id={scriptId}
      type="application/json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getRuntimeServerSideEnvVariables()),
      }}
    />
  );
};

export default RuntimeClientVarsScript;
