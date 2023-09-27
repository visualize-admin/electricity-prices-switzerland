const { transform: transformButtons } = require("./button-variant");
const { transform: transformText } = require("./text-to-typography");
const { transform: transformFontSize } = require("./theme-ui-font-size-tokens");

export default function transformer(file, api) {
  let source = file.source;
  for (let transform of [transformButtons, transformFontSize, transformText]) {
    source = transform(file, api).toSource();
  }
  return source;
}
