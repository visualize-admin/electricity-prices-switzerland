import * as React from "react";

export function IconDownload({ size = 24, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 14v6h16v-6h2v8H2v-8h2zm9-12v10.585l4-4L18.414 10 12 16.414 5.586 10 7 8.586l4 3.999V2h2z"
        fill={color}
        fillRule="evenodd"
      />
    </svg>
  );
}
