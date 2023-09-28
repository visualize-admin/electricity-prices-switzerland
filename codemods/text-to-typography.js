export const parser = "tsx";

const replacements = {
  paragraph1: {
    variant: "body1",
  },
  paragraph2: {
    variant: "body2",
  },

  heading1: { variant: "h1" },
  heading2: { variant: "h2" },
  heading3: { variant: "h3" },
  heading4: { variant: "h4" },
};

export function transform(file, api) {
  const j = api.jscodeshift;

  const root = j(file.source);

  root
    .find(j.ImportSpecifier, { imported: { name: "Text" } })
    .forEach((path) => {
      path.node.imported.name = "Typography";
    });

  root.find(j.JSXOpeningElement, { name: { name: "Text" } }).forEach((path) => {
    const node = path.node;
    node.name.name = "Typography";
    const variant = node.attributes.find(
      (x) => x.name && x.name.name === "variant"
    );
    if (!variant) {
      return;
    }
    const repl = replacements[variant.value.value];
    if (!repl) {
      return;
    }
    const extra = [];
    const attrsByName = node.attributes.reduce((acc, attr) => {
      if (attr.name) {
        acc[attr.name.name] = attr;
      } else {
        extra.push(attr);
      }
      return acc;
    }, {});
    for (let attrName of Object.keys(repl)) {
      attrsByName[attrName] = j.jsxAttribute(
        j.jsxIdentifier(attrName),
        j.literal(repl[attrName])
      );
    }
    node.attributes = Object.values(attrsByName).concat(extra);
  });

  root.find(j.JSXClosingElement, { name: { name: "Text" } }).forEach((path) => {
    const node = path.node;
    node.name.name = "Typography";
  });
}

export default (file, api) => {
  return transform(api.jscodeshift(file)).toSource();
};
