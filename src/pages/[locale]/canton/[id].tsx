import { Flex, Text } from "@theme-ui/components";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { Selector } from "../../../components/selector";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { getSource, getView, search } from "../../../graphql/rdf";
import { DetailPageBanner } from "../../../components/detail-page/banner";

type Props = {
  id: string;
  name: string;
  // providers: { id: string; name: string }[];
};

export const getServerSideProps: GetServerSideProps<
  Props,
  { locale: string; id: string }
> = async ({ params, res }) => {
  const { id } = params!;

  const source = getSource();
  const cube = await source.cube(
    "https://energy.ld.admin.ch/elcom/energy-pricing/mediancube"
  );

  if (!cube) {
    throw Error(
      `No cube ${"https://energy.ld.admin.ch/elcom/energy-pricing/cube"}`
    );
  }

  const view = getView(cube);

  const canton = (
    await search({
      view,
      source,
      query: "",
      types: ["canton"],
      ids: [id],
    })
  )[0];

  if (!canton) {
    res.statusCode = 404;
    throw Error("Not found");
  }

  return { props: { id, name: canton.name } };
};

const CantonPage = ({ id, name }: Props) => {
  return (
    <Flex sx={{ minHeight: "100vh", flexDirection: "column" }}>
      <Header></Header>
      <Flex
        sx={{
          pt: 96,
          flexGrow: 1,
          bg: "monochrome200",
          flexDirection: "column",
        }}
      >
        <DetailPageBanner id={id} name={name} />
      </Flex>
      <Footer></Footer>
    </Flex>
  );
};

export default CantonPage;
