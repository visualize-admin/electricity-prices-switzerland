import clientEnv from "src/env/client";
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
    clientEnv.NEXT_PUBLIC_VERCEL_ENV === "development" ||
    clientEnv.NEXT_PUBLIC_VERCEL_ENV === "preview"
  ) {
    flag.enable([["debug", true]]);
  }

  if (clientEnv.NEXT_PUBLIC_FLAGS) {
    try {
      const toEnable = clientEnv.NEXT_PUBLIC_FLAGS.filter((x) => {
        return flag(x) === null;
      });

      if (toEnable.length) {
        console.info(
          `Enabling flags ${toEnable} from environment variable NEXT_PUBLIC_FLAGS (skipped already enabled flags)`
        );
        flag.enable(toEnable.map((envFlag) => [envFlag, true]));
      }
    } catch (e) {
      console.error("Failed to parse NEXT_PUBLIC_FLAGS", e);
    }
  }
}

/** @knipignore */
export { flag, useFlags };

export { FlagList, useFlag };
