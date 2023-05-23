import { Trans } from "@lingui/macro";
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
import { SectionContentContainer } from "../SectionContentContainer";

const TRUNCATE_COUNT = 5;
const RelationsList = ({
  relations,
  relationPathname,
}: {
  relations: { id: string; name: string }[];
  relationPathname: string;
}) => {
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
            <Trans id="relations.showmore">{rest} weitere …</Trans>
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
  const { query } = useRouter();
  return (
    <SectionContentContainer
      sx={{
        bg: "monochrome100",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome500",
      }}
    >
      <Box
        sx={{
          px: [4, 6],
          py: 5,
          width: "100%",
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
                <Trans id="detail.homelink">Zurück zur Übersicht</Trans>
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
              {entity === "canton" ? (
                <Trans id="detail.canton">Kanton</Trans>
              ) : entity === "municipality" ? (
                <Trans id="detail.municipality">Gemeinde</Trans>
              ) : (
                <Trans id="detail.operator">Netzbetreiber</Trans>
              )}
            </Text>
            {name}
          </Text>

          <Flex sx={{ flexWrap: "wrap" }}>
            {canton && (
              <Box sx={{ pr: 3, my: 1 }}>
                <Trans id="detail.canton">Kanton</Trans>:{" "}
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
                <Trans id="detail.municipalities">Gemeinden</Trans>:{" "}
                <RelationsList
                  key={`${entity}-${id}`}
                  relationPathname={`/municipality/[id]`}
                  relations={municipalities}
                />
              </Box>
            )}
            {operators && (
              <Box sx={{ pr: 3, my: 1, fontSize: 3, lineHeight: 2 }}>
                <Trans id="detail.operators">Netzbetreiber</Trans>:{" "}
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
    </SectionContentContainer>
  );
};
