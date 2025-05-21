import { Trans } from "@lingui/macro";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Link,
  Popover,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { descending, rollup } from "d3";
import { uniqBy } from "lodash";
import { useMemo, useState } from "react";

import {
  OperatorDocument,
  OperatorDocumentCategory,
  useOperatorDocumentsQuery,
} from "src/graphql/queries";
import { Icon } from "src/icons";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useLocale } from "src/lib/use-locale";

// Define categories
const CATEGORIES = [
  {
    id: OperatorDocumentCategory.Tariffs,
    itemLabel: <Trans id="download.category.tariff">Tarifblatt</Trans>,
    categoryLabel: <Trans id="download.category.tariffs">Tarifblätter</Trans>,
  },
  {
    id: OperatorDocumentCategory.AnnualReport,
    itemLabel: (
      <Trans id="download.category.annualreport">Jahresrechnung</Trans>
    ),
    categoryLabel: (
      <Trans id="download.category.annualreports">Jahresrechnungen Netz</Trans>
    ),
  },
  {
    id: OperatorDocumentCategory.FinancialStatement,
    itemLabel: (
      <Trans id="download.category.financial-statement">Finanzbericht</Trans>
    ),
    categoryLabel: (
      <Trans id="download.category.financial-statement-report">
        Bericht zum Finanzbericht
      </Trans>
    ),
  },
];

const DocumentList = ({
  documents,
  itemLabel,
}: {
  documents: OperatorDocument[];
  itemLabel: React.ReactNode;
}) => {
  return (
    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
      {documents.map((doc) => (
        <Box
          component="li"
          key={doc.id + doc.url}
          sx={{ ml: 0, mb: 2, p: 0 }}
          typography="body2"
        >
          <Link href={doc.url} variant="body2" underline="hover">
            <Box display="flex" alignItems="center" gap={1}>
              <Icon name="file" size={20} />
              <Typography variant="body2" fontWeight={500}>
                {itemLabel} {doc.year}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (<Trans id="download.filetype.pdf">PDF-Datei</Trans>)
              </Typography>
            </Box>
          </Link>
        </Box>
      ))}
    </Box>
  );
};

export const OperatorDocuments = ({ id }: { id: string }) => {
  const locale = useLocale();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = useState<string | false>(false);
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [documentsQuery] = useOperatorDocumentsQuery({
    variables: { locale, id },
  });

  const legacyDocuments =
    documentsQuery.data?.operator?.documents ?? EMPTY_ARRAY;
  const geverDocuments =
    documentsQuery.data?.operator?.geverDocuments ?? EMPTY_ARRAY;

  const documents = uniqBy(
    [...geverDocuments, ...legacyDocuments],
    (doc) => `${doc.category} - ${doc.year}`
  );

  const documentsByCategory = useMemo(() => {
    return rollup(
      documents,
      (values) => [...values].sort((a, b) => descending(a.year, b.year)),
      (d) => d.category
    );
  }, [documents]);

  if (documentsQuery.fetching) return null;

  if (documents.length === 0) {
    return (
      <Typography variant="body2" sx={{ m: 6, color: "hint.main" }}>
        <Trans id="download.nooperatordocuments">
          Keine Netzbetreiber-Dokumente
        </Trans>
      </Typography>
    );
  }

  return (
    <>
      {/* Button Trigger */}
      <Button
        variant="text"
        startIcon={<Icon name="download" size={20} />}
        onClick={handleOpen}
        color="tertiary"
      >
        <Typography variant="body2">
          <Trans id="download.cta">Download Berichte & Tarife</Trans>
        </Typography>
      </Button>

      {/* Popover */}
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 420,
              maxWidth: "100%",
              borderRadius: 2,
              boxShadow: theme.shadows[3],
            },
          },
        }}
      >
        <Stack direction={"column"} spacing={2} py={8} px={10}>
          <Typography variant="h5" fontWeight={700}>
            <Trans id="download.reports">Download Reports</Trans>
          </Typography>

          <Typography variant="h2">{id}</Typography>
        </Stack>

        {CATEGORIES.map((category) => {
          const docs = documentsByCategory.get(category.id);
          if (!docs) return null;

          return (
            <Accordion
              key={category.id}
              expanded={expanded === category.id}
              onChange={(_, isExpanded) =>
                setExpanded(isExpanded ? category.id : false)
              }
              sx={{
                px: 10,
              }}
              disableGutters
            >
              <AccordionSummary expandIcon={<Icon name="chevrondown" />}>
                {category.categoryLabel}
              </AccordionSummary>
              <AccordionDetails>
                <DocumentList itemLabel={category.itemLabel} documents={docs} />
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Popover>
    </>
  );
};
