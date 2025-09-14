import { liftSolid, useAttributes } from "@lift-html/solid";
import { targetRefs } from "@lift-html/incentive";
import { createSignal } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";

import.meta.hot?.accept();

const elementName = "table-header";

const TableHeader = liftSolid(elementName, {
  observedAttributes: ["action-url", "field"] as const,
  init(dispose) {
    const abortController = new AbortController();
    dispose(() => abortController.abort());

    const props = useAttributes(this);

    const targets = targetRefs(this, {
      input: HTMLInputElement,
    });

    const inputEl = targets.input;

    if (!inputEl) throw new Error("input not found");

    const [searchTerm, setSearchTerm] = createSignal("");

    function buildUrl(searchTerm: string): string {
      const url = new URL(window.location.origin + props["action-url"]);
      url.searchParams.set("searchTerm", searchTerm);
      return url.pathname + url.search;
    }

    const onSearchInput = () => {
      const searchForm = this.closest("form") as HTMLFormElement;
      if (searchForm) {
        const action = buildUrl(searchTerm()); // read latest value
        searchForm.action = action;

        inputEl.value = searchTerm();

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

    inputEl.addEventListener(
      "input",
      () => {
        setSearchTerm(inputEl.value);
        trigger();
      },
      abortController,
    );
  },
});

declare module "@lift-html/core" {
  interface KnownElements {
    [elementName]: typeof TableHeader & {
      props: { "action-url": string; field: string };
    };
  }
}
