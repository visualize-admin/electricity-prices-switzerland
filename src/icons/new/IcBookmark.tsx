import type { SVGProps } from "react";
const SvgIcBookmark = (props: SVGProps<SVGSVGElement>) => (
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
      d="M5 4v16.803l6.776-3.912 6.743 3.893V4zm.75 15.504V4.75h12.019v14.735l-5.993-3.46z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgIcBookmark;
