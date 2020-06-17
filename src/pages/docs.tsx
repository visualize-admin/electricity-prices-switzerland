import {
  Catalog,
  ConfigPageOrGroup,
  ImageSpecimen,
  AudioSpecimen,
  CodeSpecimen,
  ColorSpecimen,
  ColorPaletteSpecimen,
  HtmlSpecimen,
  HintSpecimen,
  TableSpecimen,
  TypeSpecimen,
  DownloadSpecimen,
  Page,
  Markdown,
} from "catalog";
import { MDXProvider } from "@mdx-js/react";
import { useEffect, useState } from "react";

const pages: ConfigPageOrGroup[] = [
  { path: "/", title: "Introduction", content: require("../docs/index.mdx") },
  {
    title: "Components",
    pages: [
      {
        path: "/components/buttons",
        title: "Buttons",
        content: require("../docs/button.docs"),
      },
      {
        path: "/components/form",
        title: "Form",
        content: require("../docs/form.docs"),
      },
    ],
  },
];

const mdxComponents = {
  wrapper: ({ children }: $IntentionalAny) => <Page>{children}</Page>,
  h1: (props: $IntentionalAny) => (
    <Markdown.Heading level={1} text={[props.children]} slug={"wat"} />
  ),
  h2: (props: $IntentionalAny) => (
    <Markdown.Heading level={2} text={[props.children]} slug={"wat"} />
  ),
  h3: (props: $IntentionalAny) => (
    <Markdown.Heading level={3} text={[props.children]} slug={"wat"} />
  ),
  h4: (props: $IntentionalAny) => (
    <Markdown.Heading level={4} text={[props.children]} slug={"wat"} />
  ),
  h5: (props: $IntentionalAny) => (
    <Markdown.Heading level={5} text={[props.children]} slug={"wat"} />
  ),
  h6: (props: $IntentionalAny) => (
    <Markdown.Heading level={6} text={[props.children]} slug={"wat"} />
  ),
  p: Markdown.Paragraph,
  ul: Markdown.UnorderedList,
  ol: Markdown.OrderedList,
  li: Markdown.ListItem,
  blockquote: Markdown.BlockQuote,
  em: Markdown.Em,
  strong: Markdown.Strong,
  del: Markdown.Del,
  img: Markdown.Image,
  code: Markdown.CodeSpan,
  hr: Markdown.Hr,
  a: ({ href, ...props }: $IntentionalAny) => (
    <Markdown.Link to={href} {...props} />
  ),
  ImageSpecimen,
  AudioSpecimen,
  CodeSpecimen,
  ColorSpecimen,
  ColorPaletteSpecimen,
  HtmlSpecimen,
  HintSpecimen,
  TableSpecimen,
  TypeSpecimen,
  DownloadSpecimen,
};

export default () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? (
    <MDXProvider components={mdxComponents}>
      <Catalog
        title="Visualization Tool"
        pages={pages}
        theme={{
          brandColor: "#333",
          sidebarColorText: "#333",
          navBarTextColor: "#333",
          sidebarColorHeading: "#333",
          pageHeadingTextColor: "#fff",
          linkColor: "rgb(255,95,85)",
          sidebarColorTextActive: "rgb(255,95,85)",
          background: "#F5F5F5",
          pageHeadingBackground: "#156896",
        }}
      />
    </MDXProvider>
  ) : null;
};
