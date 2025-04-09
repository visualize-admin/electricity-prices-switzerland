import type { SVGProps } from "react";
const SvgIcEnvelope = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      d="M4.086 4.617v13.52h16.583V4.616zm15.43.75-7.139 4.12-7.137-4.12zm-14.68 12.02V6l7.541 4.354L19.92 6v11.386z"
    />
  </svg>
);
export default SvgIcEnvelope;
