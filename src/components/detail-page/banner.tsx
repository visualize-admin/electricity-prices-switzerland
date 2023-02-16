import { useTranslation } from "next-i18next";
import {
  Box,
  Button,
  Flex,
  Grid,
  Link as UILink,
  Text,
} from "@theme-ui/components";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";
import { Entity } from "../../domain/data";
import { Icon } from "../../icons";
import NextLink from "next/link";
import { Search } from "../search";
import { HomeLink } from "../links";

const TRUNCATE_COUNT = 5;
const RelationsList = ({
  relations,
  relationPathname,
}: {
  relations: { id: string; name: string }[];
  relationPathname: string;
}) => {
  const { t } = useTranslation();
  const { query } = useRouter();
  const [truncate, setTruncate] = useState<boolean>(true);
  const count = relations.length;

  const truncated =
    truncate && count > TRUNCATE_COUNT
      ? relations.slice(0, TRUNCATE_COUNT)
      : relations;
  const rest = truncate ? count - TRUNCATE_COUNT : 0;

  return (
    <>
      {truncated.map(({ id, name }, i) => {
        return (
          <Fragment key={id}>
            <NextLink
              href={{ pathname: relationPathname, query: { ...query, id } }}
              passHref
            >
              <UILink variant="inline">{name}</UILink>
            </NextLink>
            {i < truncated.length - 1 && ", "}
          </Fragment>
        );
      })}
      {rest > 0 && (
        <>
          {", "}
          <Button variant="inline" onClick={() => setTruncate(false)}>
            {t("relations.showmore", "{rest} weitere …")}
          </Button>
        </>
      )}
    </>
  );
};

export const DetailPageBanner = ({
  id,
  name,
  entity,
  canton,
  operators,
  municipalities,
}: {
  id: string;
  name: string;
  entity: Entity;
  canton?: { id: string; name: string };
  operators?: { id: string; name: string }[];
  municipalities?: { id: string; name: string }[];
}) => {
  const { t } = useTranslation();
  const { query } = useRouter();
  return (
    <Box
      sx={{
        px: [4, 6],
        py: 5,
        bg: "monochrome100",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome500",
      }}
    >
      <Grid
        sx={{
          mb: 6,
          gridTemplateColumns: [
            `1fr`,
            `minmax(150px,1fr) minmax(300px,3fr) minmax(150px,1fr)`,
          ],
          gridTemplateRows: [`auto 3rem 0`, `auto`],
          gridTemplateAreas: [
            `"search"
             "back"
             "."`,
            `"back search ."`,
          ],
          gap: 0,
          alignItems: "center",
          // flexDirection: ["column", "column", "row"],
          // justifyContent: "flex-start",
          // alignItems: ["flex-start", "flex-start", "center"],
          // width: "100%",
        }}
      >
        <Box
          sx={{
            gridArea: "back",
          }}
        >
          <HomeLink passHref>
            <UILink
              variant="inline"
              sx={{
                display: "flex",
                alignItems: "center",
                fontSize: 3,
                "> svg": { mr: 1 },
                ml: "-8px",
              }}
            >
              <Icon name="chevronleft" size={24}></Icon>
              {t("detail.homelink", "Zurück zur Übersicht")}
            </UILink>
          </HomeLink>
        </Box>
        <Box sx={{ gridArea: "search" }}>
          <Search />
        </Box>
      </Grid>

      <Box sx={{ mx: "auto", my: 2 }}>
        <Text as="h1" variant="heading1" sx={{ color: "monochrome800" }}>
          <Text variant="meta" sx={{ color: "secondary" }}>
            {entity === "canton"
              ? t("detail.canton", "Kanton")
              : entity === "municipality"
              ? t("detail.municipality", "Gemeinde")
              : t("detail.operator", "Netzbetreiber")}
          </Text>
          {name}
        </Text>

        <Flex sx={{ flexWrap: "wrap" }}>
          {canton && (
            <Box sx={{ pr: 3, my: 1 }}>
              {t("detail.canton", "Kanton")}:{" "}
              <NextLink
                href={{
                  pathname: `/canton/[id]`,
                  query: { ...query, id: canton.id },
                }}
                passHref
              >
                <UILink variant="inline">{canton.name}</UILink>
              </NextLink>
            </Box>
          )}
          {municipalities && (
            <Box sx={{ pr: 3, my: 1, fontSize: 3, lineHeight: 2 }}>
              {t("detail.municipalities", "Gemeinden")}:{" "}
              <RelationsList
                key={`${entity}-${id}`}
                relationPathname={`/municipality/[id]`}
                relations={municipalities}
              />
            </Box>
          )}
          {operators && (
            <Box sx={{ pr: 3, my: 1, fontSize: 3, lineHeight: 2 }}>
              {t("detail.operators", "Netzbetreiber")}:{" "}
              <RelationsList
                key={`${entity}-${id}`}
                relationPathname={`/operator/[id]`}
                relations={operators}
              />
            </Box>
          )}
        </Flex>
      </Box>
    </Box>
  );
};
