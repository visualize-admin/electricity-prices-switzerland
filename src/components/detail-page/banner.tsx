import { Icon } from "../../icons";
import { Trans } from "@lingui/macro";
import { Box, Flex, Text, Link as UILink } from "@theme-ui/components";
import * as React from "react";
import { LocalizedLink, HomeLink } from "../links";
import { useRouter } from "next/router";
import { Search } from "../search";

export const DetailPageBanner = ({
  id,
  name,
  canton,
  operators,
  municipalities,
}: {
  id: string;
  name: string;
  canton?: { id: string; name: string };
  operators?: { id: string; name: string }[];
  municipalities?: { id: string; name: string }[];
}) => {
  const { query } = useRouter();
  return (
    <Box
      sx={{
        p: 4,
        bg: "monochrome100",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome500",
      }}
    >
      <Flex
        sx={{
          flexDirection: ["column", "column", "row"],
          justifyContent: "flex-start",
          alignItems: ["flex-start", "flex-start", "center"],
          width: "100%",
          mt: 4,
          mb: 6,
        }}
      >
        <Box
          sx={{
            order: [2, 2, 1],
            flexGrow: 0,
            flexShrink: 0,
            mr: 6,
            mt: [4, 4, 0],
          }}
        >
          <HomeLink passHref>
            <UILink
              variant="inline"
              sx={{
                display: "flex",
                alignItems: "center",
                fontSize: 3,
                "> svg": { mr: 2 },
              }}
            >
              <Icon name="chevronleft" size={24}></Icon>
              <Trans id="detail.homelink">Zurück zur Übersicht</Trans>
            </UILink>
          </HomeLink>
        </Box>
        <Box sx={{ order: [1, 1, 2], flexGrow: 1, width: "100%" }}>
          <Search />
        </Box>
      </Flex>

      <Box sx={{ maxWidth: "67rem", mx: "auto", my: 2 }}>
        <Text as="h1" variant="heading1" sx={{ color: "monochrome800" }}>
          {name}
        </Text>

        <Flex sx={{ flexWrap: "wrap" }}>
          {canton && (
            <Box sx={{ pr: 3, my: 1 }}>
              <Trans id="detail.canton">Kanton</Trans>:{" "}
              <LocalizedLink
                pathname="/[locale]/canton/[id]"
                query={{ ...query, id: canton.id }}
                passHref
              >
                <UILink variant="inline">{canton.name}</UILink>
              </LocalizedLink>
            </Box>
          )}
          {municipalities && (
            <Box sx={{ pr: 3, my: 1 }}>
              <Trans id="detail.municipalities">Gemeinden</Trans>:{" "}
              {municipalities.map(({ id, name }, i) => (
                <React.Fragment key={id}>
                  <LocalizedLink
                    pathname={`/[locale]/municipality/[id]`}
                    query={{ ...query, id }}
                    passHref
                  >
                    <UILink variant="inline">{name}</UILink>
                  </LocalizedLink>
                  {i < municipalities.length - 1 && ", "}
                </React.Fragment>
              ))}
            </Box>
          )}
          {operators && (
            <Box sx={{ pr: 3, my: 1 }}>
              <Trans id="detail.operators">Netzbetreiber</Trans>:{" "}
              {operators.map(({ id, name }, i) => (
                <React.Fragment key={id}>
                  <LocalizedLink
                    pathname={`/[locale]/operator/[id]`}
                    query={{ ...query, id }}
                    passHref
                  >
                    <UILink variant="inline">{name}</UILink>
                  </LocalizedLink>
                  {i < operators.length - 1 && ", "}
                </React.Fragment>
              ))}
            </Box>
          )}
        </Flex>
      </Box>
    </Box>
  );
};
