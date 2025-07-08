import { Trans } from "@lingui/macro";
import { Box, Button, Link as UILink, Stack, Typography } from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";

import { SafeHydration } from "src/components/hydration";
import { MapLink } from "src/components/links";
import { Entity } from "src/domain/data";
import { Icon } from "src/icons";
import { useIsMobile } from "src/lib/use-mobile";

import { OperatorDocuments } from "../operator-documents";

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
            <UILink
              variant="body2"
              component={NextLink}
              href={{ pathname: relationPathname, query: { ...query, id } }}
            >
              {name}
            </UILink>
            {i < truncated.length - 1 && ", "}
          </Fragment>
        );
      })}
      {rest > 0 && (
        <>
          {", "}
          <Button variant="text" onClick={() => setTruncate(false)}>
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
  const isMobile = useIsMobile();

  return (
    <Box
      sx={{
        py: 5,
        bgcolor: "background.paper",
        width: "100%",
      }}
    >
      <Box
        display="grid"
        sx={{
          mb: { md: 6 },
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
        }}
      >
        <Box sx={{ gridArea: "back" }}>
          <UILink
            variant="body2"
            component={MapLink}
            color={"text.primary"}
            sx={{
              display: "flex",
              alignItems: "center",
              "& > svg": { mr: 1 },
            }}
          >
            <Icon name="arrowleft" size={24}></Icon>
            <Trans id="detail.maplink">Back to map view</Trans>
          </UILink>
        </Box>
      </Box>

      <Box sx={{ mx: "auto", my: 2 }}>
        <Typography
          variant="caption"
          sx={{
            color: "secondary.main",
            display: {
              xxs: "none",
              md: "block",
            },
          }}
          display="block"
        >
          {entity === "canton" ? (
            <Trans id="detail.canton">Canton</Trans>
          ) : entity === "municipality" ? (
            <Trans id="detail.municipality">Municipality</Trans>
          ) : (
            <Trans id="detail.operator">Operator</Trans>
          )}
        </Typography>
        <Stack spacing={0} direction="row" justifyContent={"space-between"}>
          <Stack>
            <Box
              display={"flex"}
              sx={{
                gap: 2,
                flexDirection: {
                  xxs: "column",
                  md: "row",
                },
                alignItems: { md: "center" },
              }}
            >
              <Stack
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Icon name="industry" size={32} />
              </Stack>
              <Typography
                component="h1"
                variant="h1"
                sx={{ color: "secondary.800" }}
              >
                {name}
              </Typography>
            </Box>

            <Box
              sx={{ flexWrap: "wrap" }}
              display="flex"
              flexDirection="column"
            >
              {canton && (
                <Box sx={{ pr: 3, my: 1 }}>
                  <Trans id="detail.canton">Canton</Trans>:{" "}
                  <NextLink
                    href={{
                      pathname: `/[entity]/[id]`,
                      query: { ...query, id: canton.id, entity: "canton" },
                    }}
                    passHref
                  >
                    <UILink variant="body2">{canton.name}</UILink>
                  </NextLink>
                </Box>
              )}
              {municipalities && (
                <Box
                  sx={{
                    pr: 3,
                    my: 1,
                    fontSize: "0.875rem",
                    lineHeight: "1.125rem",
                  }}
                >
                  <Trans id="detail.municipalities">Municipalities</Trans>:{" "}
                  <RelationsList
                    key={`${entity}-${id}`}
                    relationPathname={`/municipality/[id]`}
                    relations={municipalities}
                  />
                </Box>
              )}
              {operators && (
                <Box
                  sx={{
                    pr: 3,
                    my: 1,
                    fontSize: "0.875rem",
                    lineHeight: "1.125rem",
                  }}
                >
                  <Trans id="detail.operators">Netzbetreiber</Trans>:{" "}
                  <RelationsList
                    key={`${entity}-${id}`}
                    relationPathname={`/operator/[id]`}
                    relations={operators}
                  />
                </Box>
              )}
            </Box>
          </Stack>
          {entity === "operator" && !isMobile ? (
            <SafeHydration>
              <OperatorDocuments id={id} />
            </SafeHydration>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
};
