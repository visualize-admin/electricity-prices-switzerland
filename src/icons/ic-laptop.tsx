import type { SVGProps } from "react";
export const IconLaptop = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth={0.7}
      d="M4.35 7.35h15.3v9.3H4.35z"
    />
    <mask id="ic_Laptop_svg__a" fill="#fff">
      <path
        fillRule="evenodd"
        d="M7.258 17H2v1h20v-1h-5.268v.5H7.258z"
        clipRule="evenodd"
      />
    </mask>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M7.258 17H2v1h20v-1h-5.268v.5H7.258z"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      d="M2 17v-1H1v1zm5.258 0h1v-1h-1zM2 18H1v1h1zm20 0v1h1v-1zm0-1h1v-1h-1zm-5.268 0v-1h-1v1zm0 .5v1h1v-1zm-9.474 0h-1v1h1zM2 18h5.258v-2H2zm1 0v-1H1v1zm19-1H2v2h20zm-1 0v1h2v-1zm-4.268 1H22v-2h-5.268zm-1-1v.5h2V17zm1-.5H7.258v2h9.474zm-8.474 1V17h-2v.5z"
      mask="url(#ic_Laptop_svg__a)"
    />
  </svg>
);
