// jscodeshift can take a parser, like "babel", "babylon", "flow", "ts", or "tsx"
// Read more: https://github.com/facebook/jscodeshift#parser
export const parser = "tsx";

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  root
    .find(j.ImportDeclaration, { source: { value: "@lingui/macro" } })
    .forEach((path) => {
      const node = path.node;
      node.source.value = "next-i18next";
      node.specifiers = node.specifiers.slice(0, 1);
      for (let specifier of node.specifiers) {
        specifier.imported.name = "useTranslation";
      }
    });

  const isFunctionBody = (p) => {
    return (
      p && p.name === "body" && p.parentPath && p.parentPath.name === "init"
    );
  };

  const isUseTranslation = (p) => {
    return (
      p === "const { t } = useTranslation()" ||
      (p.type === "VariableDeclaration" &&
        p.declarations[0].init.type === "CallExpression" &&
        p.declarations[0].init.callee.name === "useTranslation")
    );
  };

  const ensureHasT = (path) => {
    let fBody = path;
    while (!isFunctionBody(fBody) && fBody) {
      fBody = fBody.parentPath;
    }
    if (fBody?.value?.body?.[0] && !isUseTranslation(fBody.value.body[0])) {
      fBody.value.body.unshift("const { t } = useTranslation()");
    }
  };

  root.find(j.CallExpression, { callee: { name: "t" } }).forEach((path) => {
    const currentArgs = path.node.arguments;
    const idArg = currentArgs[0].properties.find(
      (p) => p.key && p.key.name === "id"
    );
    const messageArg = currentArgs[0].properties.find(
      (p) => p.key && p.key.name === "message"
    );
    path.node.arguments = [
      idArg ? idArg.value : undefined,
      messageArg ? messageArg.value : undefined,
    ].filter((x) => x !== undefined);

    // Add useTranslation at top of function
    ensureHasT(path);
  });

  // Replace trans
  root
    .find(j.JSXElement, { openingElement: { name: { name: "Trans" } } })
    .forEach((path) => {
      const idAttr = path.node.openingElement.attributes.find(
        (x) => x.name.name === "id"
      );
      const idValue = idAttr.value.value;
      const children = path.node.children;
      if (!children || children.length === 0) {
        path.replace(`t('${idValue}')`);
      }
      const defaultValue = children[0].value;
      path.replace(`{ t('${idValue}', '${defaultValue.trim()}') }`);
      ensureHasT(path);
    });
  return root.toSource();
}
