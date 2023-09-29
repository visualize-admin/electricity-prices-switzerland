export default function transform(fileInfo, api) {
  /**
   * @type {import("jscodeshift").Jscodeshift}
   */
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  let i = 0;
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

        // Add the useStyles hook above the function
        let parentFunction = jsxElement;
        while (
          parentFunction.node.type !== "BlockStatement" &&
          parentFunction.node
        ) {
          parentFunction = parentFunction.parentPath;
        }

        // Step 4: Create the useStylesDeclaration with makeStyles
        const useStylesDeclaration = j.expressionStatement(
          j.assignmentExpression(
            "=",
            j.identifier(`const useStyles${i}`),
            j.callExpression(j.identifier("makeStyles"), [
              j.objectExpression([
                j.property("init", j.identifier("root"), sxValue.expression),
              ]),
            ])
          )
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
        console.log(sxValue.expression);
        if (sxValue.expression.type === "ObjectExpression") {
          sxValue.expression.properties.forEach((property) => {
            if (
              property.type === "Property" &&
              property.key.type === "Identifier"
            ) {
              const propertyName = property.key.name;
              const mappedPropertyName = propertyMapping[propertyName];

              console.log("replacing", mappedPropertyName);
              if (mappedPropertyName) {
                // Replace the property key with the mapped key
                property.key = j.identifier(mappedPropertyName);
              }
            }
          });
        }

        // Step 5: Insert the useStylesDeclaration at module level
        root.get().node.program.body.unshift(useStylesDeclaration);

        parentFunction.node.body.unshift(
          `const { classes: classes${i} } = useStyles${i}()`
        );

        // Remove the sx attribute
        jsxAttributes.splice(sxAttributeIndex, 1);
        jsxAttributes.push(
          j.jsxAttribute(
            j.jsxIdentifier("className"),
            j.jsxExpressionContainer(j.identifier(`classes${i}.root`))
          )
        );

        i++;
      }
    });

  return root.toSource();
}
