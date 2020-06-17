import { Button } from "@theme-ui/components";
import { markdown, ReactSpecimen } from "catalog";

export default () => markdown`
> Buttons are used to trigger an event after a user interaction.

There are four basic styles that are styles defined in \`rebass\`'s \`variants\`:

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
