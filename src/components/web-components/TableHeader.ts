import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("table-header")
export class TableHeader extends LitElement {
  // Use light DOM to work properly within table cells
  protected createRenderRoot() {
    return this;
  }

  private debounceTimer: number | null = null;
  private _isFirstUpdate = true;

  @property({ type: String, attribute: "action-url" }) actionUrl: string = "";
  @property({ type: String, attribute: "label" }) label: string = "";
  @property({ type: String, attribute: "field" }) field:
    | "name"
    | "price"
    | "quantity" = "name";
  @property({ type: String, attribute: "search-term" }) searchTerm: string = "";

  connectedCallback() {
    super.connectedCallback();
    this._isFirstUpdate = true;
  }

  willUpdate() {
    // Only clear content on first update after connection
    // This prevents duplication from cached HTML whe a user
    // presses the back for forward buttons on the browser
    if (this._isFirstUpdate) {
      while (this.firstChild) {
        this.removeChild(this.firstChild);
      }
      this._isFirstUpdate = false;
    }
  }

  private buildUrl(searchTerm: string): string {
    const url = new URL(window.location.origin + this.actionUrl);
    url.searchParams.set("searchTerm", searchTerm);
    return url.pathname + url.search;
  }

  private onSearchInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.searchTerm = input.value;

    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = window.setTimeout(() => {
      const searchForm = this.closest("form") as HTMLFormElement;
      if (searchForm) {
        const action = this.buildUrl(this.searchTerm);
        searchForm.action = action;

        const inputEl = searchForm.querySelector(
          'input[name="searchTerm"]',
        ) as HTMLInputElement | null;
        if (inputEl) inputEl.value = this.searchTerm;

        const active = document.activeElement as HTMLInputElement | null;
        const pos = active === input ? input.selectionStart : null;

        const handleAfterRequest = () => {
          setTimeout(() => {
            const newInput = document.querySelector(
              `table-header[field="${this.field}"] input[name="searchTerm"]`,
            ) as HTMLInputElement | null;
            if (newInput && pos !== null) {
              newInput.focus();
              newInput.setSelectionRange(pos, pos);
            }
          }, 10);
          document.body.removeEventListener(
            "htmx:afterRequest",
            handleAfterRequest,
          );
        };
        document.body.addEventListener("htmx:afterRequest", handleAfterRequest);

        searchForm.requestSubmit();
      }
      this.debounceTimer = null;
    }, 300);
  }

  render() {
    return html`
      <input
        name="searchTerm"
        type="search"
        class="input input-bordered input-xs w-24"
        placeholder="Search"
        .value=${this.searchTerm}
        @input=${this.onSearchInput}
        aria-label="Search by ${this.label.toLowerCase()}"
      />
    `;
  }
}
