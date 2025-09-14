import { liftSolid, useAttributes } from "@lift-html/solid";
import { targetRefs } from "@lift-html/incentive";
import { debounce } from "@solid-primitives/scheduled";

import.meta.hot?.accept();

const elementName = "table-header";

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
      const searchForm = this.closest("form") as HTMLFormElement;
      if (searchForm) {
        const active = document.activeElement as HTMLInputElement | null;
        const pos = active === inputEl ? inputEl.selectionStart : null;

        const handleAfterRequest = () => {
          setTimeout(() => {
            const newInput = document.querySelector(
              `table-header[field="${props.field}"] input[name="searchTerm"]`,
            ) as HTMLInputElement | null;
            if (newInput && pos !== null) {
              newInput.focus();
              newInput.setSelectionRange(pos, pos);
            }
          }, 10);
        };
        document.body.addEventListener(
          "htmx:afterRequest",
          handleAfterRequest,
          { once: true },
        );

        searchForm.requestSubmit();
      }
    };

    const trigger = debounce(onSearchInput, 300);

    inputEl.addEventListener("input", trigger, abortController);
  },
});

declare module "@lift-html/core" {
  interface KnownElements {
    [elementName]: typeof TableHeader & {
      props: { field: string };
    };
  }
}
