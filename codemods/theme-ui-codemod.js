const { transform: transformButtons } = require("./button-variant");
const { transform: transformText } = require("./text-to-typography");
const { transform: transformFontSize } = require("./theme-ui-font-size-tokens");

const transformFlex = (file, api) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  root
    .find(j.ImportDeclaration, { source: { value: "@mui/material" } })
    .forEach((path) => {
      const index = path.node.specifiers.findIndex(
        (s) => s.local.name === "Flex"
      );
      if (index !== -1) {
        path.node.specifiers.splice(index, 1);
        path.insertBefore('import Flex from "src/components/flex"');
        if (path.node.specifiers.length === 0) {
          path.prune();
        }
      }
    });

  return root;
};

export default function transformer(file, api) {
  let source = file.source;
  for (let transform of [
    // transformButtons,
    // transformFontSize,
    transformText,
    // transformFlex,
  ]) {
    source = transform({ source }, api).toSource();
  }
  return source;
}
