module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Find all import declarations
  const imports = root.find(j.ImportDeclaration);

  // Group all d3 imports
  let d3ImportSpecifiers = [];
  let hasD3Imports = false;

  // Collect all d3-* imports and their specifiers
  imports.forEach((path) => {
    const importPath = path.node.source.value;
    if (importPath.startsWith("d3-")) {
      hasD3Imports = true;
      path.node.specifiers.forEach((specifier) => {
        // Only collect ImportSpecifier (named imports)
        if (specifier.type === "ImportSpecifier") {
          // Avoid duplicates
          if (
            !d3ImportSpecifiers.some(
              (s) => s.imported.name === specifier.imported.name
            )
          ) {
            d3ImportSpecifiers.push(specifier);
          }
        }
      });
    }
  });

  // If we found d3-* imports, remove them and add a merged import
  if (hasD3Imports) {
    // Remove all d3-* imports
    root
      .find(j.ImportDeclaration)
      .filter((path) => path.node.source.value.startsWith("d3-"))
      .remove();

    // Add the consolidated d3 import if we have specifiers
    if (d3ImportSpecifiers.length > 0) {
      const newImport = j.importDeclaration(
        d3ImportSpecifiers,
        j.literal("d3")
      );

      // Add the new import at the top of the file
      const firstNode = root.find(j.Program).get("body", 0);
      if (firstNode.node) {
        j(firstNode).insertBefore(newImport);
      } else {
        root.find(j.Program).get("body").unshift(newImport);
      }
    }
  }

  return root.toSource();
};
