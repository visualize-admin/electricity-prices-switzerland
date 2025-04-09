import type { SVGProps } from "react";
const SvgIcEmbed = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="m10 18.5 3.002-13h1L11 18.5zM19.002 12l-4-2V9l5 2.5v1l-5 2.5v-1zM5 11.999l4 2v1l-5-2.5v-1l5-2.5v1z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgIcEmbed;
