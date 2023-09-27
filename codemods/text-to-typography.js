export const parser = "tsx";

export function transform(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.ImportSpecifier, { imported: { name: "Text" } })
    .forEach((path) => {
      path.node.imported.name = "Typography";
    });
}

export default (file, api) => {
  return transform(api.jscodeshift(file)).toSource();
};
