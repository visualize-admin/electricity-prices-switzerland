import { Trans } from "@lingui/macro";
import { Box, Flex, Text } from "@theme-ui/components";
import * as React from "react";
import { Link as UILink } from "theme-ui";
import { LocalizedLink } from "../links";

export const DetailPageBanner = ({
  id,
  name,
  canton,
  providers,
  municipalities,
}: {
  id: string;
  name: string;
  canton?: { id: string; name: string };
  providers?: { id: string; name: string }[];
  municipalities?: { id: string; name: string }[];
}) => {
  return (
    <Box
      sx={{
        px: 4,
        py: 6,
        bg: "monochrome100",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome500",
      }}
    >
      <Box sx={{ maxWidth: "67rem", mx: "auto", my: 2, px: 4 }}>
        <Text as="h1" variant="heading1" sx={{ color: "monochrome800" }}>
          {name}
        </Text>

        <Flex sx={{ flexWrap: "wrap" }}>
          {canton && (
            <Box sx={{ pr: 3, my: 1 }}>
              <Trans id="detail.canton">Kanton</Trans>:{" "}
              <LocalizedLink
                pathname="/[locale]/canton/[id]"
                query={{ id: canton.id }}
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
                    query={{ id }}
                    passHref
                  >
                    <UILink variant="inline">{name}</UILink>
                  </LocalizedLink>
                  {i < municipalities.length - 1 && ", "}
                </React.Fragment>
              ))}
            </Box>
          )}
          {providers && (
            <Box sx={{ pr: 3, my: 1 }}>
              <Trans id="detail.providers">Netzbetreiber</Trans>:{" "}
              {providers.map(({ id, name }, i) => (
                <React.Fragment key={id}>
                  <LocalizedLink
                    pathname={`/[locale]/provider/[id]`}
                    query={{ id }}
                    passHref
                  >
                    <UILink variant="inline">{name}</UILink>
                  </LocalizedLink>
                  {i < providers.length - 1 && ", "}
                </React.Fragment>
              ))}
            </Box>
          )}
        </Flex>
      </Box>
    </Box>
  );
};
