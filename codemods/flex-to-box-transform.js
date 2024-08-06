module.exports = function(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  return root
    .find(j.JSXElement, {
      openingElement: { name: { name: 'Flex' } }
    })
    .forEach(path => {
      const { node } = path;
      const existingProps = node.openingElement.attributes;

      // Create a new JSXAttribute for display='flex'
      const displayProp = j.jsxAttribute(
        j.jsxIdentifier('display'),
        j.literal('flex')
      );

      // Create a new opening element for Box with existing props and display='flex'
      const newOpeningElement = j.jsxOpeningElement(
        j.jsxIdentifier('Box'),
        [...existingProps, displayProp],
        node.openingElement.selfClosing
      );

      // Create a new closing element for Box if the original element wasn't self-closing
      const newClosingElement = node.openingElement.selfClosing
        ? null
        : j.jsxClosingElement(j.jsxIdentifier('Box'));

      // Replace the Flex element with the new Box element
      j(path).replaceWith(
        j.jsxElement(
          newOpeningElement,
          newClosingElement,
          node.children
        )
      );
    })
    .toSource();
};