import { Button } from "@mui/material";
import { markdown, ReactSpecimen } from "catalog";

export default () => markdown`
> There are four basic styles that are defined as Rebass \`variant\`s:

- \`primary\`
- \`secondary\`
- \`success\`
- \`outline\`


  ${(
    <ReactSpecimen span={1}>
      <Button variant="contained" color="primary">
        Primary
      </Button>
    </ReactSpecimen>
  )}


  ${(
    <ReactSpecimen span={1}>
      <Button variant="contained" color="secondary">
        Secondary
      </Button>
    </ReactSpecimen>
  )}


  ${(
    <ReactSpecimen span={1}>
      <Button variant="contained" color="success">
        Success
      </Button>
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={1}>
      <Button variant="outline">Outline</Button>
    </ReactSpecimen>
  )}

  ## How to use

~~~
import { Button } from "@mui/material"

<Button variant="primary">
  Primary button
</Button>
~~~
`;
