// Is used in _document to populate environment variables.

import {
  getRuntimeServerSideEnvVariables,
  globalVariableName,
} from "src/env/runtime";

// This component is server-side rendered and has access to process.env variables
const RuntimeClientVars = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
                window.${globalVariableName} = JSON.parse('${JSON.stringify(
          getRuntimeServerSideEnvVariables()
        )}');
            `,
      }}
    />
  );
};

export default RuntimeClientVars;
