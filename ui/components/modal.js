/* global window */

/**
 * Modal Bootstrap.
 *
 */
export const openModal = ({ title, bodyHtml }) => {
    // Supprimer modal précédente
    const existing = document.querySelector("#app-modal");
    if (existing) {
        existing.remove();
    }

    document.body.insertAdjacentHTML(
        "beforeend",
        `
    <div class="modal fade" id="app-modal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content"
             style="background:#22282d;color:#e9ecef;border:1px solid rgba(255,255,255,0.12);">

          <div class="modal-header" style="border-color: rgba(255,255,255,0.12); justify-content:space-between;">
            <h5 class="modal-title">
            <i class="bi bi-tags me-2"></i>${title}
            </h5>
            <button type="button"
                    class="btn btn-sm btn-outline-secondary"
                    data-bs-dismiss="modal"
                    aria-label="Close">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="modal-body">
            ${bodyHtml}
          </div>

        </div>
      </div>
    </div>
    `
    );

    const modalEl = document.getElementById("app-modal");

    const bs = (/** @type {any} */ (window)).bootstrap;
    if (!bs?.Modal) {
        throw new Error("Erreur chargement CDN Boostrap");
    }
    const modal = new bs.Modal(modalEl);

    // Cleanup après fermeture
    modalEl.addEventListener("hidden.bs.modal", () => {
        modal.dispose();   // détruit l’instance Bootstrap
        modalEl.remove();  // supprime le DOM
    });

    modal.show();
};



