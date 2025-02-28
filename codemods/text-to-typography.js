export const parser = "tsx";

// Press ctrl+space for code completion

export default function transformer(file, api) {
  const j = api.jscodeshift;

  const root = j(file.source);
  root
    .find(j.ImportSpecifier, { imported: { name: "Text" } })
    .forEach((path) => {
      path.node.imported.name = "Typography";
    });

  root
    .find(j.JSXElement, {
      openingElement: { name: { name: "Text" } },
    })
    .forEach((path) => {
      const { node } = path;
      const existingProps = node.openingElement.attributes;

      // Create a new opening element for Box with existing props and display='flex'
      const newOpeningElement = j.jsxOpeningElement(
        j.jsxIdentifier("Typography"),
        existingProps,
        node.openingElement.selfClosing
      );

      // Create a new closing element for Box if the original element wasn't self-closing
      const newClosingElement = node.openingElement.selfClosing
        ? null
        : j.jsxClosingElement(j.jsxIdentifier("Typography"));

      // Replace the Flex element with the new Box element
      j(path).replaceWith(
        j.jsxElement(newOpeningElement, newClosingElement, node.children)
      );
    })
    .toSource();
  return root.toSource();
}
