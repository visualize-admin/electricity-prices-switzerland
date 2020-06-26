import { markdown } from "catalog";

export default () =>
  markdown`
~~~hint|span-4
**Disclaimer**

This document specifies the concept framework and project scope of the ElCom electricity prices website.

This document is not a reference for the visual design or a specification for implementation. Do not use the illustrations in this document as a blueprint for implementation or master for graphical asset production.

Please also note that the data used in the visualizations is not always accurate.
~~~

> The design mockups illustrate an exemplary user flow.

> For an interactive experience, see the [Design Concept Prototype](./docs/prototype/index.html).

# Desktop

## Homepage

~~~image
imageContainerStyle: {border: "1px solid #ddd"}
plain: true
span: 4
src: "./docs/mockups/1.1_l_home_default.jpg"
description: "[Open full-size image](./docs/mockups/1.1_l_home_default.jpg)"
~~~

## Detail and Comparison View

This is the default detail page for a municipality, a canton, or an electricity provider, in this example "Werke am Zürichsee".

~~~image
imageContainerStyle: {border: "1px solid #ddd"}
plain: true
span: 4
src: "./docs/mockups/2.1_l_details-provider_default.jpg"
description: "[Open full-size image](./docs/mockups/2.1_l_details-provider_default.jpg)"
~~~

When adding parameters for comparison, the visualizations update.
Here we can see the prices for "Werke am Zürichsee" in 2020, 2019 and 2018.

~~~image
imageContainerStyle: {border: "1px solid #ddd"}
plain: true
span: 4
src: "./docs/mockups/2.2_l_details-provider_comparison.jpg"
description: "[Open full-size image](./docs/mockups/2.2_l_details-provider_comparison.jpg)"
~~~

The visualizations are updated and an additional color is used when a new entity is added for comparison, in this example "Services Industriels de Genève SIG".

~~~image
imageContainerStyle: {border: "1px solid #ddd"}
plain: true
span: 4
src: "./docs/mockups/2.3_l_details-provider_comparison.jpg"
description: "[Open full-size image](./docs/mockups/2.3_l_details-provider_comparison.jpg)"
~~~

# Mobile

## Homepage

~~~image
imageContainerStyle: {border: "1px solid #ddd"}
plain: true
span: 2
src: "./docs/mockups/1.1_s_home_map.png"
description: "[Open full-size image](./docs/mockups/1.1_s_home_map.png)"
~~~

~~~image
imageContainerStyle: {border: "1px solid #ddd"}
plain: true
span: 2
src: "./docs/mockups/1.2_s_home_list-default.png"
description: "[Open full-size image](./docs/mockups/1.2_s_home_list-default.png)"
~~~

~~~image
imageContainerStyle: {border: "1px solid #ddd"}
plain: true
span: 2
src: "./docs/mockups/2.1_s_details-provider_default.png"
description: "[Open full-size image](./docs/mockups/2.1_s_details-provider_default.png)"
~~~
  `;
