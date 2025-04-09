import type { SVGProps } from "react";
const SvgIcPrinter = (props: SVGProps<SVGSVGElement>) => (
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
      d="M17.127 12.626a.875.875 0 1 1-.972-1.454.875.875 0 0 1 .972 1.454m-.439-.84a.125.125 0 0 0-.172.115c0 .139.25.139.25 0a.13.13 0 0 0-.037-.088.1.1 0 0 0-.04-.027"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M15.715 10.02h2.804v8.668h-2.804v2.061H7.783v-2.061H5V10.02h2.782V4h7.933zm-.751-5.27H8.53v5.27h6.433zM8.53 19.997v-4.27h6.432v4.27zm7.184-2.057h2.054v-7.167H5.75v7.167h2.033v-2.209h-.607v-.75h9.187v.75h-.648z"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      d="M8.984 16.93h5.532v.75H8.984zM8.984 18.313h5.532v.75H8.984z"
    />
  </svg>
);
export default SvgIcPrinter;
