import type { SVGProps } from "react";
const SvgIcPlus = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      d="M19.266 11.758h-6.789V5h-.75v6.758H5v.75h6.727v6.758h.75v-6.758h6.789z"
    />
  </svg>
);
export default SvgIcPlus;
