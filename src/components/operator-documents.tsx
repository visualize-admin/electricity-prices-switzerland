import { Trans } from "@lingui/macro";
import { descending, rollup } from "d3-array";
import { uniqBy } from "lodash";
import { useMemo } from "react";
import { Box, Flex, Link, Text } from "theme-ui";

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
    <Box as="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
      {documents.map((doc) => {
        return (
          <Box
            as="li"
            key={doc.id + doc.url}
            sx={{ ml: 0, mb: 2, p: 0 }}
            variant="text.paragraph2"
          >
            <Link href={doc.url} variant="inline">
              <Flex>
                <Box sx={{ flexShrink: 0, mr: 2 }}>
                  <Icon name="pdf" size={20} />
                </Box>{" "}
                {itemLabel} {doc.year} (
                <Trans id="download.filetype.pdf">PDF-Datei</Trans>)
              </Flex>
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

  const legacyDocuments =
    documentsQuery.data?.operator?.documents ?? EMPTY_ARRAY;
  const geverDocuments =
    documentsQuery.data?.operator?.geverDocuments ?? EMPTY_ARRAY;

  // Deduplicate documents taking in priority GEVER documents
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

  if (documentsQuery.fetching) {
    // Don't show spinner here
    return null;
  }

  if (documents.length === 0) {
    return (
      <Text variant="paragraph2" sx={{ m: 6, color: "hint" }}>
        <Trans id="download.nooperatordocuments">
          Keine Netzbetreiber-Dokumente
        </Trans>
      </Text>
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
            <Text as="h4" sx={{ mb: 3 }} variant="lead">
              {category.categoryLabel}
            </Text>
            <DocumentList itemLabel={category.itemLabel} documents={docs} />
          </Box>
        );
      })}
    </>
  );
};
