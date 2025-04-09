import type { SVGProps } from "react";
const SvgIcFile = (props: SVGProps<SVGSVGElement>) => (
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
      d="M9.155 4v.017L5.024 9.703H5v10.88h13.519V4zm.003 1.29V9.7H5.953zM5.75 19.833h12.019V4.75H9.905v5.703H5.75z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgIcFile;
