// Is used in _document to populate environment variables.

import { globalVariableName } from "src/env/client";

// This component is server-side rendered and has access to process.env variables
const RuntimeClientVars = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
                window.${globalVariableName} = JSON.parse('${JSON.stringify({
          PUBLIC_URL: process.env.VERCEL_URL || process.env.PUBLIC_URL,
        })}');
            `,
      }}
    />
  );
};

export default RuntimeClientVars;
