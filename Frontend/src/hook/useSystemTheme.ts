import { useEffect, useState } from "react"; // Importing useEffect and useState from 'react' library

type SystemTheme = "dark" | "light"; // Define a type for the system theme

/**
 * React hook for the system theme (dark or light mode).
 */
export const useSystemTheme = (): SystemTheme => {

  // Define state variable to hold the current system theme
  const [theme, setTheme] = useState<SystemTheme>(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  // useEffect hook to handle changes in the system theme and update the state
  useEffect(() => {
    if (window.matchMedia) {
      const matcher = window.matchMedia("(prefers-color-scheme: dark)");
      setTheme(matcher.matches ? "dark" : "light");

      // Function to handle changes in the system theme
      const changeListener = (evt: MediaQueryListEventMap["change"]) => {
        setTheme(evt.matches ? "dark" : "light");
      };

      matcher.addEventListener('change', changeListener); // Add event listener for system theme changes
      return () => {
        matcher.removeEventListener("change", changeListener); // Remove event listener when the component unmounts
      };
    }
  }, []);

  return theme; // Return the current system theme
};
