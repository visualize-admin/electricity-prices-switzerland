import { markdown } from "catalog";

export default () =>
  markdown`
~~~hint|span-3
**Disclaimer**

This document specifies the concept framework and project scope of the ElCom electricity prices website.

This document is not a reference for the visual design or a specification for implementation. Do not use the illustrations in this document as a blueprint for implementation or master for graphical asset production.

Please also note that the data used in the visualization is not always accurate.
~~~

# Desktop

## Homepage

~~~image
plain: true
span: 4
src: "./docs/mockups/1.1_l_home_default.jpg"
description: "[Open full-size image](./docs/mockups/1.1_l_home_default.jpg)"
~~~

## Comparison View

~~~image
plain: true
span: 4
src: "./docs/mockups/2.1_l_details-provider_default.jpg"
description: "[Open full-size image](./docs/mockups/2.1_l_details-provider_default.jpg)"
~~~

~~~image
plain: true
span: 4
src: "./docs/mockups/2.2_l_details-provider_comparison.jpg"
description: "[Open full-size image](./docs/mockups/2.2_l_details-provider_comparison.jpg)"
~~~

~~~image
plain: true
span: 4
src: "./docs/mockups/2.3_l_details-provider_comparison.jpg"
description: "[Open full-size image](./docs/mockups/2.3_l_details-provider_comparison.jpg)"
~~~

# Mobile

## Homepage

~~~image
plain: true
span: 2
src: "./docs/mockups/1.1_s_home_map.png"
description: "[Open full-size image](./docs/mockups/1.1_s_home_map.png)"
~~~

~~~image
plain: true
span: 2
src: "./docs/mockups/1.2_s_home_list-default.png"
description: "[Open full-size image](./docs/mockups/1.2_s_home_list-default.png)"
~~~
  `;
