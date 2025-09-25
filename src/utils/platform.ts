type PlatformString = "macos" | "windows" | "linux" | "default";
const getPlatform = (): PlatformString => {
  if (typeof navigator === "undefined") {
    return "default";
  }
  const platform = navigator?.platform?.toLowerCase() || "unknown";
  if (platform.includes("mac")) return "macos";
  if (platform.includes("win")) return "windows";
  if (platform.includes("linux")) return "linux";
  return "default";
};

const matchPlatform = <T>({
  macos,
  windows,
  linux,
  default: defaultFn,
}: {
  macos: () => T;
  windows: () => T;
  linux: () => T;
  default: () => T;
}): T => {
  const platform = getPlatform();
  switch (platform) {
    case "macos":
      return macos();
    case "windows":
      return windows();
    case "linux":
      return linux();
    default:
      return defaultFn();
  }
};

const shouldOpenInNewTab = (ev: Event) => {
  const typedEv = ev as React.MouseEvent | MouseEvent;
  return matchPlatform({
    macos: () => "metaKey" in typedEv && typedEv.metaKey,
    default: () => "ctrlKey" in typedEv && typedEv.ctrlKey,
    linux: () => "ctrlKey" in typedEv && typedEv.ctrlKey,
    windows: () => "ctrlKey" in typedEv && typedEv.ctrlKey,
  });
};

export { shouldOpenInNewTab };
