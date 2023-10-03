import { ColorItem } from "@storybook/blocks";

export const ImageSpecimen = ({ src }: { src: string }) => <img src={src} />;
export const ColorPaletteSpecimen = ({
  colors,
}: {
  colors: { name: string; value: string }[];
}) => {
  return (
    <ColorItem
      colors={Object.fromEntries(colors.map((c) => [c.name, c.value]))}
      title={""}
      subtitle={""}
    />
  );
};
export const ColorSpecimen = ({
  name,
  value,
}: {
  name: string;
  value: string;
}) => {
  return <ColorItem colors={{ [name]: value }} title={""} subtitle={""} />;
};
