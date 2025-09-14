import type { Htmlify, KnownElements, Solidify } from "@lift-html/core";

declare global {
  interface HTMLElementTagNameMap extends Htmlify<KnownElements> {}
}

declare global {
  namespace astroHTML.JSX {
    interface IntrinsicElements
      extends Solidify<
        astroHTML.JSX.DefinedIntrinsicElements["span"],
        KnownElements
      > {}
  }
}
