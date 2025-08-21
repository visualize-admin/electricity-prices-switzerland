import { useRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";

export const useScrollPersistence = <T extends { scrollY?: number }>(
  state: T,
  setQueryState: (updates: Partial<T>) => void
) => {
  const router = useRouter();
  const scrollRestoredRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const justRestoredRef = useRef(false);

  const saveScrollPosition = useCallback(() => {
    if (justRestoredRef.current) {
      return;
    }

    const scrollY = window.scrollY;
    const maxScrollY =
      document.documentElement.scrollHeight - window.innerHeight;

    const scrollPercentage =
      maxScrollY > 0 ? Math.round((scrollY / maxScrollY) * 100) : 0;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (scrollY > 0) {
        setQueryState({ scrollY: scrollPercentage } as Partial<T>);
      } else {
        setQueryState({
          scrollY: null as unknown as T["scrollY"],
        } as Partial<T>);
      }
    }, 300);
  }, [setQueryState]);

  const restoreScrollPosition = useCallback(() => {
    if (scrollRestoredRef.current || !state.scrollY) {
      return;
    }

    const restoreScroll = () => {
      const scrollPercentage = state.scrollY!;
      const maxScrollY =
        document.documentElement.scrollHeight - window.innerHeight;
      const targetScrollY = (scrollPercentage / 100) * maxScrollY;

      justRestoredRef.current = true;

      window.scrollTo(0, targetScrollY);
      scrollRestoredRef.current = true;

      setTimeout(() => {
        justRestoredRef.current = false;
      }, 1000);
    };

    const waitForContent = () => {
      const currentHeight = document.documentElement.scrollHeight;

      setTimeout(() => {
        const newHeight = document.documentElement.scrollHeight;
        if (newHeight === currentHeight && newHeight > 0) {
          restoreScroll();
        } else {
          waitForContent();
        }
      }, 200);
    };

    if (document.readyState === "complete") {
      setTimeout(waitForContent, 100);
    } else {
      const handleLoad = () => {
        setTimeout(waitForContent, 100);
        window.removeEventListener("load", handleLoad);
      };
      window.addEventListener("load", handleLoad);
    }
  }, [state.scrollY]);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(saveScrollPosition);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [saveScrollPosition]);

  useEffect(() => {
    if (!scrollRestoredRef.current) {
      restoreScrollPosition();
    }
  }, [restoreScrollPosition, state.scrollY]);

  useEffect(() => {
    scrollRestoredRef.current = false;
    justRestoredRef.current = false;
  }, [router.asPath]);

  return {
    scrollY: state.scrollY,
    saveScrollPosition,
    restoreScrollPosition,
  };
};
