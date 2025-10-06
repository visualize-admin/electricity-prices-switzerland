/**
 * Flags System Overview:
 *
 * Flags can be set in multiple ways with the following priority (highest to lowest):
 * 1. URL search parameters (e.g., ?flag.debug=true)
 * 2. Runtime environment variables (process.env.FLAGS on server, fetched via /api/flags)
 * 3. Programmatic defaults (development/preview environments)
 *
 * For runtime configuration, use process.env.FLAGS with a JSON array of flag names:
 * FLAGS='["debug", "sunshine"]'
 *
 * Runtime flags are automatically loaded via useRuntimeFlags() hook called in _app.tsx.
 */

import { useEffect } from "react";

import { clientBuildEnv } from "src/env/client";
import { runtimeEnv } from "src/env/runtime";
import { createComponents, createHooks } from "src/flags";

const specs = {
  /** Activates flag control in top bar */
  debug: {},

  /** Activates flag control in top bar */
  debugInfoDialog: {},

  /** Show sunshine specific UI */
  sunshine: {},

  /** Show dynamic electricity tariffs */
  dynamicElectricityTariffs: {},

  /** Show mock operational standards chart */
  mockOperationalStandardsChart: {},

  /** Shows coverage ratio in map tooltips */
  coverageRatio: {},

  /**
   * Deactivate setting locale from URL, only rely on Next router locale.
   * This should be set permanently at some point. The flag is there to
   * be able to test safely in production.
   */
  noManualLocaleActivate: {},
} as const;

const keysAsValues = <R extends Record<string | number | symbol, unknown>>(
  record: R
) =>
  Object.fromEntries(Object.keys(record).map((x) => [x, x])) as {
    [K in keyof typeof record]: K;
  };

/** Helper to access flags, provides documentation */
export const F = keysAsValues(specs);

/** @knipignore */
export type StrompreiseFlag = keyof typeof F;

const flagHooks = createHooks<StrompreiseFlag>("strompreise");
const { flag, useFlag, useFlags } = flagHooks;
const { FlagList } = createComponents(flagHooks);

/**
 * Custom hook to load runtime flags from the server.
 * Should be called early in the application lifecycle (e.g., in _app.tsx).
 */
const useRuntimeFlags = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const setRuntimeFlags = async () => {
      try {
        const runtimeFlags = runtimeEnv.FLAGS || [];

        const toEnable = runtimeFlags.filter((x: string) => {
          return flag(x) === null;
        });

        if (toEnable.length > 0) {
          console.info(
            `Enabling runtime flags ${toEnable.join(
              ", "
            )} from server environment (skipped already enabled flags)`
          );
          flag.enable(toEnable.map((envFlag: string) => [envFlag, true]));
        }
      } catch (error) {
        console.error("Failed to fetch runtime flags:", error);
      }
    };

    setRuntimeFlags();
  }, []);
};

// biome-ignore lint/complexity/useOptionalChain: window is checked for undefined
if (typeof window !== "undefined" && window.location) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.flag = flag;
  flag.initFromSearchParams(window.location.search);

  // Production flags
  if (window.location.host !== "www.strompreis.elcom.admin.ch") {
    flag.enable([
      // Set flags here that need to be active everywhere apart from
      // production site
      // ex: ["autocompleteBrowseSearch", true]
    ]);
  }

  // Development flags
  if (
    process.env.NODE_ENV === "development" ||
    clientBuildEnv.NEXT_PUBLIC_VERCEL_ENV === "development" ||
    clientBuildEnv.NEXT_PUBLIC_VERCEL_ENV === "preview"
  ) {
    flag.enable([["debug", true]]);
  }
}

/** @knipignore */
export { flag, useFlags };

export { FlagList, useFlag, useRuntimeFlags };
