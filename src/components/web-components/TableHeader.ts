import { liftSolid, useAttributes } from "@lift-html/solid";
import { createEffect, onCleanup } from "solid-js";
import { targetRefs } from "@lift-html/incentive";
import { debounce } from "@solid-primitives/scheduled";

import.meta.hot?.accept();

const elementName = "table-header";

const focusState = new Map<string, { pos: number | null; text: string }>();

const TableHeader = liftSolid(elementName, {
  observedAttributes: ["field"] as const,
  init(dispose) {
    const abortController = new AbortController();
    dispose(() => abortController.abort());

    const props = useAttributes(this);

    const targets = targetRefs(this, {
      input: HTMLInputElement,
    });

    const inputEl = targets.input;

    if (!inputEl) throw new Error("input not found");

    const onSearchInput = () => {
      const searchForm = this.closest("form");
      if (searchForm) {
        searchForm.requestSubmit();
      }
    };

    const trigger = debounce(onSearchInput, 300);

    inputEl.addEventListener("input", trigger, abortController);

    createEffect(() => {
      const field = props.field;
      if (!field) throw new Error(elementName + " attribute field is required");
      const abortController = new AbortController();
      onCleanup(() => abortController.abort());

      document.body.addEventListener(
        "htmx:beforeSwap",
        () => {
          const active = document.activeElement as HTMLInputElement | null;
          const pos = active === inputEl ? inputEl.selectionStart : null;
          focusState.set(field, { pos, text: inputEl.value });
        },
        abortController,
      );

      document.body.addEventListener(
        "htmx:afterSwap",
        () => {
          const { pos, text } = focusState.get(field) ?? {
            pos: null,
            text: "",
          };
          if (pos !== null) {
            inputEl.focus();
            if (text !== inputEl.value) {
              inputEl.value = text;
              trigger();
            }
            inputEl.setSelectionRange(pos, pos);
          }
        },
        abortController,
      );
    });
  },
});

declare module "@lift-html/core" {
  interface KnownElements {
    [elementName]: typeof TableHeader & {
      props: { field: string };
    };
  }
}
