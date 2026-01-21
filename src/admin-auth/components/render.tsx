import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { getDefaultedFlags } from "src/admin-auth/flags";
import { SessionConfigFlags } from "src/admin-auth/flags";

import { Dashboard, LoginForm, ErrorPage } from "./index";

interface RenderDashboardOptions {
  message?: string;
  messageLink?: {
    href: string;
    text: string;
  };
  error?: string;
}

export function renderDashboard(
  partialFlags: Partial<SessionConfigFlags>,
  csrfToken: string,
  options?: RenderDashboardOptions
): string {
  const flags = getDefaultedFlags(partialFlags);

  const html = renderToStaticMarkup(
    <Dashboard
      flags={flags}
      csrfToken={csrfToken}
      message={options?.message}
      messageLink={options?.messageLink}
      error={options?.error}
    />
  );

  return `<!DOCTYPE html>${html}`;
}

export function renderLoginForm(
  csrfToken: string,
  errorMessage?: string
): string {
  const html = renderToStaticMarkup(
    <LoginForm csrfToken={csrfToken} errorMessage={errorMessage} />
  );

  return `<!DOCTYPE html>${html}`;
}

export function renderErrorPage(message: string): string {
  const html = renderToStaticMarkup(<ErrorPage message={message} />);

  return `<!DOCTYPE html>${html}`;
}
