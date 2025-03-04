import { useEffect } from "react";

type KeyCombination = {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
};

export const useKey = (combination: KeyCombination, callback: () => void) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const isMatching =
        event.key === combination.key &&
        (combination.metaKey ? event.metaKey : true) &&
        (combination.ctrlKey ? event.ctrlKey : true);

      if (isMatching) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [combination, callback]);
};
