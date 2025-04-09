import type { SVGProps } from "react";
const SvgIcTablet = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path fill="currentColor" d="M9.766 5.227h3.993v.75H9.766z" />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M5 20.583V4h13.519v16.583zM17.769 6.457V4.75H5.75v1.707zm0 .746v10.17H5.75V7.202zM5.75 18.125v1.707h12.019v-1.707z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgIcTablet;
