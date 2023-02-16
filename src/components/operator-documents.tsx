import { useTranslation, i18n, TFunction } from "next-i18next";
import { descending, rollup } from "d3-array";
import { uniqBy } from "lodash";
import { useMemo } from "react";
import { Box, Flex, Link, Text } from "theme-ui";
import {
  OperatorDocument,
  OperatorDocumentCategory,
  useOperatorDocumentsQuery,
} from "../graphql/queries";
import { Icon } from "../icons";
import { EMPTY_ARRAY } from "../lib/empty-array";
import { useLocale } from "../lib/use-locale";

const getCategories = (t: TFunction) => [
  {
    id: OperatorDocumentCategory.Tariffs,
    itemLabel: t("download.category.tariff", "Tarifblatt"),
    categoryLabel: t("download.category.tariffs", "Tarifblätter"),
  },
  {
    id: OperatorDocumentCategory.AnnualReport,
    itemLabel: t("download.category.annualreport", "Jahresrechnung"),
    categoryLabel: t(
      "download.category.annualreports",
      "Jahresrechnungen Netz"
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
  const { t } = useTranslation();
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
                {itemLabel} {doc.year}({t("download.filetype.pdf", "PDF-Datei")}
                )
              </Flex>
            </Link>
          </Box>
        );
      })}
    </Box>
  );
};

export const OperatorDocuments = ({ id }: { id: string }) => {
  const { t } = useTranslation();
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
        {t("download.nooperatordocuments", "Keine Netzbetreiber-Dokumente")}
      </Text>
    );
  }

  const CATEGORIES = getCategories(t);

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
