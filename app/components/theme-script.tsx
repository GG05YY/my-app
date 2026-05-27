import Script from "next/script";

const themeInit = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var dark = stored === "dark" || (!stored && prefersDark);
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return (
    <Script id="theme-init" strategy="beforeInteractive">
      {themeInit}
    </Script>
  );
}
