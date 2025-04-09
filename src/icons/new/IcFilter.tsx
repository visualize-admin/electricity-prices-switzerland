import type { SVGProps } from "react";
const SvgIcFilter = (props: SVGProps<SVGSVGElement>) => (
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
      d="M9.481 20.564h4.556v-9.185l4.482-2.86V4H5v4.519l4.481 2.86zm3.806-.75h-3.056v-8.845L5.75 8.109V4.75h12.019v3.358l-4.482 2.86z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgIcFilter;
