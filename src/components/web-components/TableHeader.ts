import { liftSolid } from "@lift-html/solid";
import { targetRefs } from "@lift-html/incentive";
import { debounce } from "@solid-primitives/scheduled";

import.meta.hot?.accept();

const elementName = "table-header";

const TableHeader = liftSolid(elementName, {
  init(dispose) {
    const abortController = new AbortController();
    dispose(() => abortController.abort());

    const targets = targetRefs(this, {
      input: HTMLInputElement,
    });

    const inputEl = targets.input;

    if (!inputEl) throw new Error("input not found");

    const trigger = debounce((cb: () => void) => cb(), 300);

    inputEl.addEventListener(
      "input",
      () => {
        const searchForm = this.closest("form");
        if (searchForm) {
          window.htmx.trigger(searchForm, "htmx:abort", undefined);
          trigger(() => {
            searchForm.requestSubmit();
          });
        }
      },
      abortController,
    );
  },
});

declare module "@lift-html/core" {
  interface KnownElements {
    [elementName]: typeof TableHeader & { props: {} };
  }
}
