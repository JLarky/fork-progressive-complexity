/// <reference types="astro/client" />
/// <reference types="./custom-elements.ts" />
interface Window {
  htmx: typeof import("htmx.org");
}
