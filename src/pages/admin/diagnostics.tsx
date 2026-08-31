import { Box, Chip, List, ListItemButton, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import React, { FormEvent, useState } from "react";

import AdminLayout from "src/admin-auth/components/admin-layout";
import { generateCSRFToken } from "src/admin-auth/crsf";
import { parseSessionFromRequest } from "src/admin-auth/session";
import { LoadingIconInline } from "src/components/hint";
import { inferReportFromMapUrl } from "src/domain/diagnostics/map-url-diagnosis";
import { REPORT_SPECS, ReportId } from "src/domain/diagnostics/report-specs";

type ReportResult =
  | { status: "idle" }
  | { status: "fetching" }
  | { status: "fetched"; text: string; data: unknown }
  | { status: "error"; code: string; message: string };

function DiagnosticsExplorer() {
  const [selectedId, setSelectedId] = useState<ReportId>(REPORT_SPECS[0].id);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formKey, setFormKey] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<ReportResult>({ status: "idle" });

  const selectedSpec = REPORT_SPECS.find((r) => r.id === selectedId)!;

  const runReport = async (
    reportId: ReportId,
    values: Record<string, string>
  ) => {
    setResult({ status: "fetching" });

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (value !== "") params.set(key, value);
    }

    try {
      const res = await fetch(
        `/api/admin/diagnostics/${reportId}?${params.toString()}`
      );
      const json = await res.json();
      if (json.ok) {
        setResult({ status: "fetched", text: json.text, data: json.data });
      } else {
        setResult({
          status: "error",
          code: json.code,
          message: json.message,
        });
      }
    } catch (e) {
      setResult({
        status: "error",
        code: "FETCH_FAILED",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  };

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const formData = Object.fromEntries(
      new FormData(ev.currentTarget as HTMLFormElement)
    ) as Record<string, string>;
    runReport(selectedId, formData);
  };

  const selectReport = (reportId: ReportId) => {
    setSelectedId(reportId);
    setFormValues({});
    setFormKey((k) => k + 1);
    setParseError(null);
    setResult({ status: "idle" });
  };

  const handleParse = (ev: FormEvent) => {
    ev.preventDefault();
    const formData = Object.fromEntries(
      new FormData(ev.currentTarget as HTMLFormElement)
    ) as { url: string };

    const diagnosis = inferReportFromMapUrl(formData.url);
    if (!diagnosis) {
      setParseError("Couldn't recognize a map URL in that.");
      return;
    }

    setParseError(null);
    setSelectedId(diagnosis.reportId);
    setFormValues(diagnosis.values);
    setFormKey((k) => k + 1);
    setResult({ status: "idle" });

    const spec = REPORT_SPECS.find((r) => r.id === diagnosis.reportId)!;
    const effective: Record<string, string> = {};
    for (const field of spec.fields) {
      effective[field.name] =
        diagnosis.values[field.name] ?? field.defaultValue ?? "";
    }
    const hasEverythingRequired = spec.fields.every(
      (field) => !field.required || effective[field.name] !== ""
    );
    if (hasEverythingRequired) {
      runReport(diagnosis.reportId, effective);
    }
  };

  return (
    <Box display="flex" gap={4}>
      <Box width={320} flexShrink={0}>
        <Box
          component="form"
          onSubmit={handleParse}
          display="flex"
          flexDirection="column"
          gap={1}
          mb={3}
          pb={3}
          borderBottom={1}
          borderColor="divider"
        >
          <label>
            Paste a map URL:
            <br />
            <input type="text" name="url" style={{ width: "100%" }} />
          </label>
          <button type="submit">Parse</button>
          {parseError && (
            <Typography variant="caption" color="error">
              {parseError}
            </Typography>
          )}
        </Box>

        <List disablePadding>
          {REPORT_SPECS.map((spec) => (
            <ListItemButton
              key={spec.id}
              selected={spec.id === selectedId}
              onClick={() => selectReport(spec.id)}
            >
              {spec.label}
            </ListItemButton>
          ))}
        </List>

        <Box
          key={`${selectedId}-${formKey}`}
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexDirection="column"
          gap={2}
          mt={3}
        >
          {selectedSpec.fields.map((field) => {
            const defaultValue =
              formValues[field.name] ?? field.defaultValue ?? "";
            return field.kind === "select" ? (
              <label key={field.name}>
                {field.label}
                {field.required ? " *" : ""}:{" "}
                <select name={field.name} defaultValue={defaultValue}>
                  <option value="" />
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label key={field.name}>
                {field.label}
                {field.required ? " *" : ""}:{" "}
                <input
                  type="text"
                  name={field.name}
                  defaultValue={defaultValue}
                />
              </label>
            );
          })}
          <button type="submit" disabled={result.status === "fetching"}>
            {result.status === "fetching" ? "Running…" : "Run"}
          </button>
        </Box>
      </Box>

      <Box flex={1} minWidth={0}>
        {result.status === "idle" && (
          <Typography color="text.secondary">
            Pick a report and run it, or paste a map URL.
          </Typography>
        )}
        {result.status === "fetching" && <LoadingIconInline />}
        {result.status === "error" && (
          <Box>
            <Chip label={result.code} color="error" sx={{ mb: 1 }} />
            <Typography>{result.message}</Typography>
          </Box>
        )}
        {result.status === "fetched" && (
          <Box>
            <Box
              component="pre"
              sx={{
                fontSize: "0.85rem",
                whiteSpace: "pre-wrap",
                overflowX: "auto",
              }}
            >
              {result.text}
            </Box>
            <details style={{ marginTop: 16 }}>
              <summary style={{ cursor: "pointer" }}>Raw JSON</summary>
              <Box
                component="pre"
                sx={{ fontSize: "0.75rem", overflowX: "auto" }}
              >
                {JSON.stringify(result.data, null, 2)}
              </Box>
            </details>
          </Box>
        )}
      </Box>
    </Box>
  );
}

interface Props {
  csrfToken: string;
}

export default function DiagnosticsPage({ csrfToken }: Props) {
  return (
    <AdminLayout
      title="Diagnostics"
      csrfToken={csrfToken}
      breadcrumbs={[{ label: "Admin" }, { label: "Diagnostics" }]}
    >
      <Typography variant="body2" color="text.secondary" mb={4}>
        Runs the same reports as <code>pnpm energy-prices:cli</code> against
        this deployment&apos;s GraphQL API.
      </Typography>
      <DiagnosticsExplorer />
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
        destination: "/admin/login?return_to=/admin/diagnostics",
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
