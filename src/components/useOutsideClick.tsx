import { useEffect } from "react";

const useOutsideClick = (
  ref: React.RefObject<HTMLElement>,
  callback: () => void
): void => {
  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [ref, callback]);
};

export default useOutsideClick;
