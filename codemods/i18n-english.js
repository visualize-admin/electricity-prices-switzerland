const englishTranslations = require("../src/locales/en/messages.ts").messages;

/**
 * This transform replaces the message attribute in t({ id, message }) function calls and <Trans id='' message=''> components
 * with the English version of the message from a given translations object.
 */
module.exports = function (file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);

  /**
   * Handles t({ id, message }) function calls
   */
  function handleTFunctionCalls(path) {
    // Find t function calls
    return path
      .find(j.CallExpression, {
        callee: { name: "t" },
      })
      .forEach((path) => {
        const args = path.node.arguments;
        if (args.length > 0 && args[0].type === "ObjectExpression") {
          const objProps = args[0].properties;
          const idProp = objProps.find(
            (prop) => prop.key.name === "id" || prop.key.value === "id"
          );

          if (!idProp) return;

          let idValue;
          if (idProp.value.type === "StringLiteral") {
            idValue = idProp.value.value;
          } else if (idProp.value.type === "Literal") {
            idValue = idProp.value.value;
          }

          console.log("idValue", idValue);
          if (!idValue || !englishTranslations[idValue]) return;

          // Find the message property to replace
          const messagePropIndex = objProps.findIndex(
            (prop) =>
              prop.key.name === "message" || prop.key.value === "message"
          );

          if (messagePropIndex >= 0) {
            // Replace the message with English translation
            objProps[messagePropIndex].value = j.stringLiteral(
              englishTranslations[idValue]
            );
          }
        }
      });
  }

  /**
   * Handles <Trans id='' message=''> components
   */
  function handleTransComponents(path) {
    // Find Trans JSX elements
    return path
      .find(j.JSXElement, {
        openingElement: {
          name: {
            name: "Trans",
          },
        },
      })
      .forEach((path) => {
        const attributes = path.node.openingElement.attributes;

        // Find id attribute
        const idAttr = attributes.find(
          (attr) => attr.type === "JSXAttribute" && attr.name.name === "id"
        );

        if (!idAttr) return;

        let idValue;
        if (idAttr.value.type === "StringLiteral") {
          idValue = idAttr.value.value;
        } else if (idAttr.value.type === "Literal") {
          idValue = idAttr.value.value;
        } else if (
          idAttr.value.type === "JSXExpressionContainer" &&
          idAttr.value.expression.type === "StringLiteral"
        ) {
          idValue = idAttr.value.expression.value;
        } else if (
          idAttr.value.type === "JSXExpressionContainer" &&
          idAttr.value.expression.type === "Literal"
        ) {
          idValue = idAttr.value.expression.value;
        }

        if (!idValue || !englishTranslations[idValue]) return;

        // Find and replace the children of the Trans component with the English translation
        if (path.node.children && path.node.children.length > 0) {
          // Clear existing children
          path.node.children = [
            // Replace with a single text node containing the English translation
            j.jsxText(englishTranslations[idValue]),
          ];
        } else {
          // If no children, add the translation as a child
          path.node.children = [j.jsxText(englishTranslations[idValue])];
        }

        // Optionally, remove the message attribute if it exists
        const messageAttrIndex = attributes.findIndex(
          (attr) => attr.type === "JSXAttribute" && attr.name.name === "message"
        );

        if (messageAttrIndex >= 0) {
          attributes.splice(messageAttrIndex, 1);
        }
      });
  }

  // Apply transformations
  handleTFunctionCalls(root);
  handleTransComponents(root);

  return root.toSource();
};
