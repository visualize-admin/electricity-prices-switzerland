import { Box, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import React, { FormEvent, useMemo } from "react";

import AdminLayout from "src/admin-auth/components/admin-layout";
import { generateCSRFToken } from "src/admin-auth/crsf";
import { parseSessionFromRequest } from "src/admin-auth/session";
import { LINDAS_ENDPOINTS } from "src/rdf/lindas-endpoints";

const useLindasDescribeQuery = () => {
  const [state, setState] = React.useState<{
    data: string | null;
    error: string | null;
    status: "idle" | "fetching" | "fetched" | "error";
  }>({ data: null, error: null, status: "idle" });

  const execute = async (options: {
    endpoint: string;
    sparqlQuery: string;
  }) => {
    setState({ data: null, error: null, status: "fetching" });
    try {
      const text = await fetch(options.endpoint, {
        method: "POST",
        body: `query=${encodeURIComponent(options.sparqlQuery)}`,
        headers: {
          Accept: "application/n-triples",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }).then((r) => r.text());
      setState({ data: text, error: null, status: "fetched" });
    } catch (e) {
      setState({
        data: null,
        error: e instanceof Error ? e.message : String(e),
        status: "error",
      });
    }
  };

  return [state, execute] as const;
};

function MunicipalityForm() {
  const [query, execute] = useLindasDescribeQuery();

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const formData = Object.fromEntries(
      new FormData(ev.currentTarget as HTMLFormElement)
    ) as { endpoint: string; municipalityName: string; municipalityId: string };

    execute({
      endpoint: formData.endpoint,
      sparqlQuery: formData.municipalityName
        ? `DESCRIBE ?municipality WHERE {
  ?municipality a <https://schema.ld.admin.ch/Municipality>.
  ?municipality <http://schema.org/name> "${formData.municipalityName}".
}`
        : `DESCRIBE <https://ld.admin.ch/municipality/${formData.municipalityId}>`,
    });
  };

  const municipalityId = useMemo(() => {
    if (!query.data) return null;
    const match = /https:\/\/ld.admin.ch\/municipality\/([0-9]*)/.exec(
      query.data
    );
    return match ? match[1] : null;
  }, [query.data]);

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
          Endpoint:
          <select name="endpoint" style={{ marginLeft: 8 }}>
            <option value={LINDAS_ENDPOINTS.int}>int.lindas.admin.ch</option>
            <option value={LINDAS_ENDPOINTS.prod}>lindas.admin.ch</option>
          </select>
        </label>
        <Typography variant="body2" color="text.secondary">
          Use either municipality name or BFS id.
        </Typography>
        <label>
          Municipality name (exact):{" "}
          <input
            type="text"
            name="municipalityName"
            style={{ marginLeft: 8 }}
          />
        </label>
        <label>
          Municipality BFS id (e.g. 261 for Zürich):{" "}
          <input type="text" name="municipalityId" style={{ marginLeft: 8 }} />
        </label>
        <div>
          <button disabled={query.status === "fetching"} type="submit">
            {query.status === "fetching" ? "Loading…" : "Fetch municipality"}
          </button>
        </div>
      </Box>

      {query.status === "fetched" && (
        <Box mt={2}>
          {query.data && municipalityId ? (
            <Typography color="success.main">
              Found municipality id {municipalityId}
            </Typography>
          ) : (
            <Typography color="error.main">
              Could not find municipality
            </Typography>
          )}
          {query.data && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer" }}>Raw response</summary>
              <pre style={{ fontSize: "0.75rem", marginTop: 8 }}>
                {query.data}
              </pre>
            </details>
          )}
        </Box>
      )}

      {query.error && (
        <Typography color="error" mt={2}>
          Error: {query.error}
        </Typography>
      )}
    </Box>
  );
}

interface Props {
  csrfToken: string;
}

export default function MunicipalityStatusPage({ csrfToken }: Props) {
  return (
    <AdminLayout
      title="Municipality Status"
      csrfToken={csrfToken}
      breadcrumbs={[{ label: "Admin" }, { label: "Municipality Status" }]}
    >
      <Typography variant="body2" color="text.secondary" mb={4}>
        Look up a municipality by name or BFS id against a LINDAS endpoint.
      </Typography>
      <MunicipalityForm />
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
        destination: "/admin/login?return_to=/admin/municipality-status",
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
