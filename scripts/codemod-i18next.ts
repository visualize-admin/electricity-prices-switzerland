import { API, FileInfo, Node, ASTNode, ASTPath, Statement } from "jscodeshift";

// jscodeshift can take a parser, like "babel", "babylon", "flow", "ts", or "tsx"
// Read more: https://github.com/facebook/jscodeshift#parser
export const parser = "tsx";

const typePredicate =
  <T extends ASTNode, S extends ASTNode["type"]>(
    type: S,
    predicate?: (o: Extract<T, { type: S }>) => boolean
  ) =>
  (p: T | undefined): p is Extract<T, { type: S }> => {
    if (!p) {
      return false;
    }
    return (
      p.type === type && (!predicate || predicate(p as Extract<T, { type: S }>))
    );
  };

const isPropertyWithIdentifier = (identifierName: string) =>
  typePredicate("ObjectProperty", (p) => {
    return p.key?.type === "Identifier" && p.key.name === identifierName;
  });

const isFunctionBody = (p) => {
  return p && p.name === "body" && p.parentPath && p.parentPath.name === "init";
};

const truthy = <T>(p: T): p is Exclude<T, undefined | null | false> => {
  return !!p;
};

const isUseTranslation = (p: ASTNode | string) => {
  return (
    p === "const { t } = useTranslation()" ||
    typePredicate("VariableDeclaration", (p) => {
      const firstDeclaration = p.declarations[0];
      if (firstDeclaration.type !== "VariableDeclarator") {
        return false;
      }
      return (
        firstDeclaration.init?.type === "CallExpression" &&
        firstDeclaration.init.callee.type === "Identifier" &&
        firstDeclaration.init.callee.name === "useTranslation"
      );
    })
  );
};

const ensureHasT = (path: ASTPath) => {
  let fBody = path;
  while (!isFunctionBody(fBody) && fBody) {
    fBody = fBody.parentPath;
  }
  const block = fBody?.value as Extract<ASTNode, { type: "BlockStatement" }>;
  if (block.body?.[0] && !isUseTranslation(block.body[0])) {
    // @ts-ignore
    block.body.unshift("const { t } = useTranslation()");
  }
};

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Change @lingui/macro import to useTranslation import from next-i18next
  root
    .find(j.ImportDeclaration, { source: { value: "@lingui/macro" } })
    .forEach((path) => {
      const node = path.node;
      node.source.value = "next-i18next";
      node.specifiers = node.specifiers?.slice(0, 1) || [];
      for (let specifier of node.specifiers) {
        if (specifier.type === "ImportSpecifier") {
          specifier.imported.name = "useTranslation";
        }
      }
    });

  // Change t calls, t({ id: 'my-id', message: 'default' }) -> t('my-id', 'default')
  root.find(j.CallExpression, { callee: { name: "t" } }).forEach((path) => {
    const currentArgs = path.node.arguments;
    const firstArg = currentArgs[0];
    if (firstArg.type !== "ObjectExpression") {
      return;
    }

    const properties = firstArg?.properties;

    const idArg = properties.find(isPropertyWithIdentifier("id"));
    const messageArg = properties.find(isPropertyWithIdentifier("message"));

    const idValue = idArg?.value;
    const messageValue = messageArg?.value;
    if (idValue?.type !== "Literal" || messageValue?.type !== "Literal") {
      return;
    }
    path.node.arguments = [
      idArg ? idValue : undefined,
      messageArg ? messageValue : undefined,
    ].filter(truthy);

    // Add useTranslation at top of function
    ensureHasT(path);
  });

  // Replace Trans, <Trans id="my-id">Default value</Trans> -> t('my-id', 'Default value')
  root
    .find(j.JSXElement, { openingElement: { name: { name: "Trans" } } })
    .forEach((path) => {
      const attributes = path.node.openingElement?.attributes || [];
      const idAttr = attributes.find(
        typePredicate("JSXAttribute", (x) => x.name.name === "id")
      );
      const idValue = idAttr?.value;
      if (!idValue || !typePredicate("Literal")(idValue)) {
        return;
      }
      const idValueValue = idValue?.value;
      const children = path.node.children;
      if (!children || children.length === 0) {
        path.replace(`t('${idValueValue}')` as unknown as ASTNode);
      }
      const firstChild = children?.[0];
      if (!typePredicate("Literal")(firstChild)) {
        return;
      }
      const defaultValue = firstChild.value;
      if (typeof defaultValue !== "string") {
        return;
      }
      path.replace(
        `{ t('${idValue}', '${defaultValue.trim()}') }` as unknown as ASTNode
      );
      ensureHasT(path);
    });
  return root.toSource();
}
