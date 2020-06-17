import { Button } from "@theme-ui/components";
import { markdown, ReactSpecimen } from "catalog";

export default () => markdown`
> There are four basic styles that are defined as Rebass \`variant\`s:

- \`primary\`
- \`secondary\`
- \`success\`
- \`outline\`


  ${(
    <ReactSpecimen span={1}>
      <Button variant="primary">Primary</Button>
    </ReactSpecimen>
  )}


  ${(
    <ReactSpecimen span={1}>
      <Button variant="secondary">Secondary</Button>
    </ReactSpecimen>
  )}


  ${(
    <ReactSpecimen span={1}>
      <Button variant="success">Success</Button>
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={1}>
      <Button variant="outline">Outline</Button>
    </ReactSpecimen>
  )}

  ## How to use

~~~
import { Button } from "@theme-ui/components"

<Button variant="primary">
  Primary button
</Button>
~~~
`;
