import * as React from "react";

export function IconMap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M14.854 7.198L9.938 4.654 4.832 7.398v12.756l5.113-2.748 4.919 2.546 5.02-2.747V4.445l-5.03 2.753zm-4.537-1.504l4.167 2.157v11.06l-4.167-2.156V5.695zM5.582 7.848l3.985-2.143v11.053L5.582 18.9V7.848zm13.552 8.912l-3.9 2.134V7.846l3.9-2.134V16.76z"
        fill="currentColor"
      />
    </svg>
  );
}
