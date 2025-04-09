import type { SVGProps } from "react";
const SvgIcStar = (props: SVGProps<SVGSVGElement>) => (
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
      d="m7.197 19.92 5.173-2.719 5.172 2.72-.987-5.76 4.185-4.08-5.784-.84L12.37 4 9.783 9.24 4 10.081l4.185 4.08zm9.348-1.37-4.177-2.197L8.19 18.55l.797-4.651-3.379-3.294 4.67-.68 2.089-4.23 2.088 4.23 4.67.68-3.379 3.294z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgIcStar;
