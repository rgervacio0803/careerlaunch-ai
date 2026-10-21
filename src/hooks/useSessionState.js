import { useEffect, useState } from "react";

const PREFIX = "careerlaunch:";

function read(key, initialValue) {
  try {
    const stored = window.sessionStorage.getItem(PREFIX + key);
    return stored === null ? initialValue : JSON.parse(stored);
  } catch {
    return initialValue;
  }
}

/**
 * useState that survives a page refresh. Values live in sessionStorage, so
 * they stay in this browser tab only and are cleared when the tab closes.
 */
export default function useSessionState(key, initialValue) {
  const [value, setValue] = useState(() => read(key, initialValue));

  useEffect(() => {
    try {
      window.sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Storage full or blocked (private mode): keep working in memory.
    }
  }, [key, value]);

  return [value, setValue];
}

/** Removes everything saved by useSessionState. */
export function clearSessionState() {
  try {
    Object.keys(window.sessionStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => window.sessionStorage.removeItem(key));
  } catch {
    // Nothing saved, or storage blocked.
  }
}
