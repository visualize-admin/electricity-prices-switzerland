import withBundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import { nodeFileTrace } from "@vercel/nft";
import { NextConfig } from "next";

import { defaultLocale, locales } from "src/locales/config";

import pkg from "./package.json";

const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const { I18N_DOMAINS } = process.env;

const buildEnv = {
  VERSION: `v${pkg.version}`,
  ALLOW_ENGLISH: process.env.ALLOW_ENGLISH,
};

type I18NDomains = { domain: string; defaultLocale: string }[];
let i18nDomains: I18NDomains | undefined;

try {
  if (I18N_DOMAINS !== undefined) {
    const domainsEnv = JSON.parse(I18N_DOMAINS) as Record<string, string>;
    i18nDomains = Object.entries(domainsEnv).map(([locale, domain]) => ({
      domain: String(domain), // Ensure domain is string
      defaultLocale: locale,
    }));
  }
} catch (e) {
  if (e instanceof SyntaxError) {
    console.error("I18N_DOMAINS parsing failed:", e.message);
  }
}

const nextConfig = async (): Promise<NextConfig> => {
  const { fileList: additionalTracedFiles } = await nodeFileTrace(
    [
      require.resolve("./configure-proxy"),
      require.resolve("global-agent/bootstrap"),
    ],
    {
      ignore: (file) =>
        file.replace(/\\/g, "/").startsWith("node_modules/.bin/"),
    }
  );

  const config: NextConfig = {
    output: "standalone",

    outputFileTracingIncludes: {
      "**": [...additionalTracedFiles],
    },

    outputFileTracingExcludes: {
      "/": [".git", ".next/cache"],
    },

    env: buildEnv,

    pageExtensions: ["js", "ts", "tsx"],

    i18n: {
      locales,
      defaultLocale,
      domains: i18nDomains,
      localeDetection: false,
    },

    eslint: {
      ignoreDuringBuilds: true,
    },

    typescript: {
      ignoreBuildErrors: true,
    },

    webpack(config, { isServer }) {
      if (!isServer) {
        config.resolve.fallback = { fs: false };
      }
      config.module.rules.push({
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: "graphql-tag/loader",
      });

      if (isServer) {
        config.resolve.extensions.unshift(".server.ts", ".server.tsx");
      } else {
        config.resolve.extensions.unshift(".browser.ts", ".browser.tsx");
      }
      return config;
    },
  };

  const res = withBundleAnalyzerConfig(config);
  return res;
};

export default withSentryConfig(nextConfig, {
  org: "interactive-things",
  project: "elcom-strompreise",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
  // tunnelRoute: "/monitoring",
});
