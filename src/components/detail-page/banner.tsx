import { Trans } from "@lingui/macro";
import { Box, Button, Typography, Link as UILink } from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";

import { MapLink } from "src/components/links";
import { Entity } from "src/domain/data";
import { Icon } from "src/icons";

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

  return (
    <Box
      sx={{
        px: [6, 12],
        py: 5,
        bgcolor: "background.paper",
        width: "100%",
      }}
    >
      <Box
        display="grid"
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
              ml: "-8px",
            }}
          >
            <Icon name="arrowleft" size={24}></Icon>
            <Trans id="detail.homelink">Zurück zur Übersicht</Trans>
          </UILink>
        </Box>
      </Box>

      <Box sx={{ mx: "auto", my: 2 }}>
        <Typography
          variant="caption"
          sx={{ color: "secondary.main" }}
          display="block"
        >
          {entity === "canton" ? (
            <Trans id="detail.canton">Kanton</Trans>
          ) : entity === "municipality" ? (
            <Trans id="detail.municipality">Gemeinde</Trans>
          ) : (
            <Trans id="detail.operator">Netzbetreiber</Trans>
          )}
        </Typography>
        {/* FIXME: Make a dropdown for all entity types */}

        <Box
          display={"flex"}
          sx={{
            gap: 2,
            alignItems: "center",
          }}
        >
          <Icon name="industry" size={32} />
          <Typography
            component="h1"
            variant="h1"
            sx={{ color: "secondary.800" }}
          >
            {name}
          </Typography>
        </Box>

        <Box sx={{ flexWrap: "wrap" }} display="flex" flexDirection="column">
          {canton && (
            <Box sx={{ pr: 3, my: 1 }}>
              <Trans id="detail.canton">Kanton</Trans>:{" "}
              <NextLink
                href={{
                  pathname: `/details/[entity]/[id]`,
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
              <Trans id="detail.municipalities">Gemeinden</Trans>:{" "}
              <RelationsList
                key={`${entity}-${id}`}
                relationPathname={`/details/municipality/[id]`}
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
                relationPathname={`/details/operator/[id]`}
                relations={operators}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
