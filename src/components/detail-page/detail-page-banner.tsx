import { Trans } from "@lingui/macro";
import { Box, Flex, Text } from "@theme-ui/components";
import * as React from "react";
import { Link as UILink } from "theme-ui";
import { LocalizedLink } from "./../../components/links";

export const DetailPageBanner = ({
  entity,
  kanton,
  linkedIds,
}: {
  entity: string;
  kanton?: string;
  linkedIds: string[];
}) => {
  return (
    <Box sx={{ px: 4, py: 6, bg: "monochrome100" }}>
      <Box sx={{ maxWidth: "65rem", mx: "auto", my: 2 }}>
        <Text as="h1" variant="heading1" sx={{ color: "monochrome800" }}>
          {entity}
        </Text>

        <Flex sx={{ flexWrap: "wrap" }}>
          {kanton && (
            <Box sx={{ pr: 3, my: 1 }}>
              <Trans id="detail.canton">Kanton</Trans>:{" "}
              <LocalizedLink
                pathname="/[locale]/canton/[id]"
                query={{ id: kanton }}
                passHref
              >
                <UILink variant="inline">{kanton}</UILink>
              </LocalizedLink>
            </Box>
          )}
          <Box sx={{ pr: 3, my: 1 }}>
            <Trans id="detail.municipality">Netzbetrieber</Trans>:{" "}
            {linkedIds.map((id, i) => (
              <React.Fragment key={i}>
                <LocalizedLink
                  pathname="/[locale]/provider/[id]"
                  query={{ id: id }}
                  passHref
                >
                  <UILink variant="inline">{id}</UILink>
                </LocalizedLink>
                {i < linkedIds.length - 1 && ", "}
              </React.Fragment>
            ))}
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};
