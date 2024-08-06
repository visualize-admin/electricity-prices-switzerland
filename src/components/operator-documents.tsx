import { Trans } from "@lingui/macro";
import { Box, Link, Typography } from "@mui/material";
import { descending, rollup } from "d3-array";
import { uniqBy } from "lodash";
import { useMemo } from "react";

import {
  OperatorDocument,
  OperatorDocumentCategory,
  useOperatorDocumentsQuery,
} from "src/graphql/queries";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useLocale } from "src/lib/use-locale";

import { Icon } from "../icons";

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
      {documents.map((doc) => {
        return (
          <Box
            component="li"
            key={doc.id + doc.url}
            sx={{ ml: 0, mb: 2, p: 0 }}
            variant="text.body2"
          >
            <Link href={doc.url} variant="inline">
              <Box display="flex">
                <Box sx={{ flexShrink: 0, mr: 2 }}>
                  <Icon name="pdf" size={20} />
                </Box>{" "}
                {itemLabel} {doc.year}(
                <Trans id="download.filetype.pdf">PDF-Datei</Trans>)
              </Box>
            </Link>
          </Box>
        );
      })}
    </Box>
  );
};

export const OperatorDocuments = ({ id }: { id: string }) => {
  const locale = useLocale();

  const [documentsQuery] = useOperatorDocumentsQuery({
    variables: { locale, id },
  });

  const geverDocuments =
    documentsQuery.data?.operator?.geverDocuments ?? EMPTY_ARRAY;

  const documents = uniqBy(
    geverDocuments,
    (doc) => `${doc.category} - ${doc.year}`
  );

  const documentsByCategory = useMemo(() => {
    return rollup(
      documents,
      (values) => [...values].sort((a, b) => descending(a.year, b.year)),
      (d) => d.category
    );
  }, [documents]);

  if (documentsQuery.fetching) {
    // Don't show spinner here
    return null;
  }

  if (documents.length === 0) {
    return (
      <Typography variant="body2" sx={{ m: 6, color: "hint" }}>
        <Trans id="download.nooperatordocuments">
          Keine Netzbetreiber-Dokumente
        </Trans>
      </Typography>
    );
  }

  return (
    <>
      {CATEGORIES.map((category) => {
        const docs = documentsByCategory.get(category.id);

        if (!docs) {
          return null;
        }

        return (
          <Box key={category.id} sx={{ mx: 4, my: 6 }}>
            <Typography component="h4" sx={{ mb: 3 }} variant="lead">
              {category.categoryLabel}
            </Typography>
            <DocumentList itemLabel={category.itemLabel} documents={docs} />
          </Box>
        );
      })}
    </>
  );
};
