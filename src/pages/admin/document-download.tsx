import { Box, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import React, { FormEvent } from "react";

import AdminLayout from "src/admin-auth/components/admin-layout";
import { generateCSRFToken } from "src/admin-auth/crsf";
import { parseSessionFromRequest } from "src/admin-auth/session";

const GEVER_DOCUMENTS_QUERY = `
  query DebugGeverDocuments($id: String!) {
    operator(id: $id, locale: "de") {
      geverDocuments {
        docs { id name url year category }
        meta { referenceId uid }
        debug { request response bindings { ipsts rpsts service } }
      }
    }
  }
`;

type GeverDocumentsQueryResult = {
  operator: {
    geverDocuments: {
      docs: {
        id: string;
        name: string;
        url: string;
        year: string;
        category: string | null;
      }[];
      meta: { referenceId: string | null; uid: string | null };
      debug: {
        request: string;
        response: string;
        bindings: { ipsts: string; rpsts: string; service: string };
      } | null;
    };
  } | null;
};

function DocumentDownloadForm() {
  const [status, setStatus] = React.useState<
    "idle" | "fetching" | "fetched" | "error"
  >("idle");
  const [data, setData] = React.useState<GeverDocumentsQueryResult | null>(
    null
  );
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const formData = Object.fromEntries(
      new FormData(ev.currentTarget as HTMLFormElement)
    ) as { oid: string; secret: string };

    setStatus("fetching");
    setData(null);
    setError(null);

    try {
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gever-debug-secret": formData.secret,
        },
        body: JSON.stringify({
          query: GEVER_DOCUMENTS_QUERY,
          variables: { id: formData.oid },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.errors?.length) throw new Error(json.errors[0].message);
      setData(json.data as GeverDocumentsQueryResult);
      setStatus("fetched");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  };

  const geverDocuments = data?.operator?.geverDocuments;
  const meta = geverDocuments?.meta;
  const debug = geverDocuments?.debug;

  return (
    <Box>
      <Box
        component="form"
        onSubmit={handleSubmit}
        display="flex"
        flexDirection="column"
        gap={2}
        maxWidth={400}
      >
        <label>
          Password:{" "}
          <input type="password" name="secret" style={{ marginLeft: 8 }} />
        </label>
        <label>
          OID:{" "}
          <input
            type="text"
            name="oid"
            placeholder="218"
            style={{ marginLeft: 8 }}
          />
        </label>
        <div>
          <button disabled={status === "fetching"} type="submit">
            {status === "fetching" ? "Loading…" : "Fetch documents"}
          </button>
        </div>
      </Box>

      {error && (
        <Typography color="error" mt={2}>
          Error: {error}
        </Typography>
      )}

      {geverDocuments && (
        <Box mt={3} fontSize="0.8rem">
          <div>
            UID:{" "}
            <pre style={{ display: "inline" }}>{meta?.uid ?? "not found"}</pre>
          </div>
          <div>
            Reference ID (NBReferenzID):{" "}
            <pre style={{ display: "inline" }}>
              {meta?.referenceId ?? "not used"}
            </pre>
          </div>
          <div>
            Documents ({geverDocuments.docs.length}):
            <pre>{JSON.stringify(geverDocuments.docs, null, 2)}</pre>
          </div>
          {debug ? (
            <div>
              <div>
                Bindings
                <pre>{JSON.stringify(debug.bindings, null, 2)}</pre>
              </div>
              <div>
                Search request
                <br />
                <textarea cols={100} rows={30} readOnly value={debug.request} />
              </div>
              <div>
                Search response
                <br />
                <textarea
                  cols={100}
                  rows={30}
                  readOnly
                  value={debug.response}
                />
              </div>
            </div>
          ) : (
            <Typography color="text.secondary" mt={1}>
              Provide the password above to see SOAP debug info.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

interface Props {
  csrfToken: string;
}

export default function DocumentDownloadPage({ csrfToken }: Props) {
  return (
    <AdminLayout
      title="Document Download"
      csrfToken={csrfToken}
      breadcrumbs={[{ label: "Admin" }, { label: "Document Download" }]}
    >
      <Typography variant="body2" color="text.secondary" mb={4}>
        Debug the GEVER document download integration for an operator.
      </Typography>
      <DocumentDownloadForm />
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await parseSessionFromRequest(context.req);
  if (!session) {
    return {
      redirect: {
        destination: "/admin/login?return_to=/admin/document-download",
        permanent: false,
      },
    };
  }
  return {
    props: {
      csrfToken: generateCSRFToken(session.sessionId),
    },
  };
};
