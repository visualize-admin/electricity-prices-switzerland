import { useEffect, useState } from "react";

/**
 * This component ensures that its children are only rendered after the first
 * client-side render, which helps avoid hydration issues in React applications.
 * It uses `requestAnimationFrame` to delay the rendering until the next frame,
 * ensuring that the DOM is fully ready before displaying the children.
 *
 * We should try to avoid using this component as much as possible, but it can be
 * useful in cases where components rely on external libraries.
 */
export const SafeHydration = ({ children }: { children: React.ReactNode }) => {
  const [render, setRender] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setRender(true));
  }, []);
  return render ? children : null;
};
