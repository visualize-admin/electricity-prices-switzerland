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

import { spin } from "src/components/hint";
import {
  OperatorDocument,
  OperatorDocumentCategory,
  useOperatorDocumentsQuery,
} from "src/graphql/queries";
import { Icon } from "src/icons";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useLocale } from "src/lib/use-locale";

export function groupByCategory(
  documents: {
    __typename: "OperatorDocument";
    id: string;
    name: string;
    url: string;
    year: string;
    category?: OperatorDocumentCategory | null;
  }[]
) {
  return rollup(
    documents,
    (values) => [...values].sort((a, b) => descending(a.year, b.year)),
    (d) => d.category
  );
}

// Define categories
const CATEGORIES = [
  {
    id: OperatorDocumentCategory.Tariffs,
    itemLabel: <Trans id="download.category.tariff">Tariff sheet</Trans>,
    categoryLabel: <Trans id="download.category.tariffs">Tariffs</Trans>,
  },
  {
    id: OperatorDocumentCategory.AnnualReport,
    itemLabel: (
      <Trans id="download.category.annualreport">Financial statements</Trans>
    ),
    categoryLabel: (
      <Trans id="download.category.annualreports">Annual Reports</Trans>
    ),
  },
  {
    id: OperatorDocumentCategory.FinancialStatement,
    itemLabel: (
      <Trans id="download.category.financial-statement">Financial report</Trans>
    ),
    categoryLabel: (
      <Trans id="download.category.financial-statement-report">
        Report on the financial report
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
    <Box
      component="ul"
      m={0}
      p={0}
      sx={{
        listStyle: "none",
        "& > * + * ": { mt: 2 },
      }}
    >
      {documents.map((doc) => (
        <Box
          component="li"
          key={doc.id + doc.url}
          typography="body2"
          ml={0}
          p={0}
        >
          <Link href={doc.url} variant="body2" underline="hover">
            <Box display="flex" alignItems="center" gap={1}>
              <Icon name="file" size={20} />
              <Typography variant="body2" fontWeight={500}>
                {itemLabel} {doc.year}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (<Trans id="download.filetype.pdf">PDF file</Trans>)
              </Typography>
            </Box>
          </Link>
        </Box>
      ))}
    </Box>
  );
};

export const OperatorDocumentsPopoverContent = ({
  documentsByCategory,
  operatorName,
  loading,
}: {
  operatorName: string;
  documentsByCategory:
    | Map<OperatorDocumentCategory, OperatorDocument[]>
    | Map<OperatorDocumentCategory | null | undefined, OperatorDocument[]>;
  loading: boolean;
}) => {
  const empty = documentsByCategory.size === 0;
  const [expanded, setExpanded] = useState<string | false>(false);

  return (
    <>
      <Stack direction={"column"} spacing={2} py={8} px={10}>
        <Typography variant="h5" fontWeight={700}>
          <Trans id="download.reports">Download reports</Trans>
        </Typography>
        <Typography variant="h2">{operatorName}</Typography>
      </Stack>
      {loading || empty ? (
        <Box px={10} pb={10}>
          {loading ? (
            <Box display="flex" alignItems={"center"} gap={1}>
              <Box
                height={24}
                width={24}
                sx={{
                  animation: `1s linear infinite ${spin}`,
                }}
              >
                <Icon name="loading" size={24} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                <Trans>Loading Reports</Trans>
              </Typography>
            </Box>
          ) : null}
          {empty && !loading ? (
            <Typography variant="body2" color="text.secondary">
              <Trans id="download.nooperatordocuments">
                No network operator documents
              </Trans>
            </Typography>
          ) : null}
        </Box>
      ) : (
        CATEGORIES.map((category) => {
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
              <AccordionDetails sx={{ "&&": { px: 0 } }}>
                <DocumentList itemLabel={category.itemLabel} documents={docs} />
              </AccordionDetails>
            </Accordion>
          );
        })
      )}
    </>
  );
};

export const OperatorDocuments = ({ id }: { id: string }) => {
  const locale = useLocale();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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
    return groupByCategory(documents);
  }, [documents]);

  return (
    <>
      {/* Button Trigger */}
      <Button
        variant="text"
        startIcon={<Icon name="download" size={20} />}
        onClick={handleOpen}
        color="tertiary"
        sx={{ flexShrink: 0 }}
      >
        <Typography
          variant="body2"
          display={{
            xxs: "none",
            md: "block",
          }}
        >
          <Trans id="download.cta">Download reports & tariffs</Trans>
        </Typography>
      </Button>
      {/* Popover */}
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableScrollLock
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
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
        <OperatorDocumentsPopoverContent
          documentsByCategory={documentsByCategory}
          loading={documentsQuery.fetching}
          operatorName={documentsQuery.data?.operator?.name || ""}
        />
      </Popover>
    </>
  );
};
