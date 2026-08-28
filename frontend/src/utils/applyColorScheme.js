/**
 * Alinha o dark mode do Tailwind (`class`) ao tema MUI (`preferredTheme`).
 * Sem isso, `dark:bg-gray-800` segue o SO e os cards ficam carvão no tema claro.
 */
export function applyColorScheme(mode) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const isDark = mode === "dark";

  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
}
