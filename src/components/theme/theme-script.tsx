/**
 * Sets <html data-theme> before the first paint: the visitor's choice (localStorage
 * "pr-theme") or else the device setting, which is followed live. Without JavaScript the
 * light theme is shown.
 */
const script = `(function(){try{var k="pr-theme",m=window.matchMedia("(prefers-color-scheme: dark)"),e=document.documentElement;function a(){var p=localStorage.getItem(k);e.dataset.theme=p==="light"||p==="dark"?p:m.matches?"dark":"light"}a();m.addEventListener("change",a)}catch(_){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
