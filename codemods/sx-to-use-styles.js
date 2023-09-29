export default function transform(fileInfo, api) {
  /**
   * @type {import("jscodeshift").Jscodeshift}
   */
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  let i = 0;

  const makeStyleOptions = j.objectExpression([]);
  const useStylesDeclaration = j.expressionStatement(
    j.assignmentExpression(
      "=",
      j.identifier(`const useStyles${i}`),
      j.callExpression(j.identifier("makeStyles()"), [makeStyleOptions])
    )
  );

  // Step 1: Find every React element with an sx property
  root
    .find(j.JSXElement)
    .find(j.JSXAttribute, {
      name: {
        type: "JSXIdentifier",
        name: "sx",
      },
    })
    .forEach((path) => {
      // Step 2: Extract content of the sx property into a useStyles hook
      const jsxElement = path.parentPath.parentPath; // JSXElement
      const jsxAttributes = jsxElement.node.attributes;
      const sxAttributeIndex = jsxAttributes.findIndex(
        (attr) => attr.name && attr.name.name === "sx"
      );

      if (sxAttributeIndex >= 0) {
        const sxAttribute = jsxAttributes[sxAttributeIndex];
        const sxValue = sxAttribute.value;

        if (sxValue.expression.properties.length < 4) {
          return;
        }

        // Add the useStyles hook above the function
        let parentFunction = jsxElement;
        while (
          parentFunction.node.type !== "BlockStatement" &&
          parentFunction.node
        ) {
          parentFunction = parentFunction.parentPath;
        }

        // Step 4: Create the useStylesDeclaration with makeStyles
        makeStyleOptions.properties.push(
          j.property("init", j.identifier(`root${i}`), sxValue.expression)
        );

        const propertyMapping = {
          m: "margin",
          p: "padding",
          pt: "paddingTop",
          pb: "paddingBottom",
          pl: "paddingLeft",
          pr: "paddingRight",
          ml: "marginLeft",
          mr: "marginRight",
          mt: "marginTop",
          mb: "marginBottom",
        };

        // Traverse through the object expression properties
        if (sxValue.expression.type === "ObjectExpression") {
          sxValue.expression.properties.forEach((property) => {
            if (
              property.type === "ObjectProperty" &&
              property.key.type === "Identifier"
            ) {
              const propertyName = property.key.name;
              const mappedPropertyName = propertyMapping[propertyName];

              if (mappedPropertyName) {
                // Replace the property key with the mapped key
                property.key = j.identifier(mappedPropertyName);
              }
            }
          });
        }

        parentFunction.node.body.unshift(`const { classes } = useStyles()`);

        // Remove the sx attribute
        jsxAttributes.splice(sxAttributeIndex, 1);
        jsxAttributes.push(
          j.jsxAttribute(
            j.jsxIdentifier("className"),
            j.jsxExpressionContainer(j.identifier(`classes.root${i}`))
          )
        );

        i++;
      }
    });

  // Step 5: Insert the useStylesDeclaration at module level
  root.get().node.program.body.unshift(useStylesDeclaration);
  return root.toSource();
}
