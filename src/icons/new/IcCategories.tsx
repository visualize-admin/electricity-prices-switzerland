import type { SVGProps } from "react";
const SvgIcCategories = (props: SVGProps<SVGSVGElement>) => (
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
      d="M4 4h4.82l10.376 10.375-.245.265-4.306 4.445-.266.273L4 8.98zm.75 4.669 9.62 9.621 1.561-1.61 2.219-2.29-9.64-9.64H4.75z"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M6.135 5.8a1.5 1.5 0 1 1 1.667 2.494A1.5 1.5 0 0 1 6.135 5.8m.556 1.663a.5.5 0 1 0 .556-.832.5.5 0 0 0-.556.832"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgIcCategories;
