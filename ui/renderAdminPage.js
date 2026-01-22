import { renderOrders } from "./renderOrders.js";
import { renderAdminCategories } from "./renderAdminCategories.js";
import { renderAdminProducts } from "./renderAdminProducts.js";

/**
 * Dashboard Admin
 *
 * @param {object} app
 * @param {object} [options]
 * @param {string} [options.containerSelector]
 */
export const renderAdminPage = (app, { containerSelector = "#admin" } = {}) => {
  const container = document.querySelector(containerSelector);
  if (!container) {
    throw new Error(`renderAdminPage: conteneur introuvable (${containerSelector})`);
  }

  container.innerHTML = `
    <div class="AdminPage accordion" id="adminAccordion">

      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#adminOrders">
            Dernières commandes
          </button>
        </h2>
        <div id="adminOrders" class="accordion-collapse collapse show" data-bs-parent="#adminAccordion">
          <div class="accordion-body">
            <div id="admin-orders"></div>
          </div>
        </div>
      </div>

      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#adminCats">
            Catégories
          </button>
        </h2>
        <div id="adminCats" class="accordion-collapse collapse" data-bs-parent="#adminAccordion">
          <div class="accordion-body">
            <div id="admin-categories"></div>
          </div>
        </div>
      </div>

      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#adminProds">
            Articles
          </button>
        </h2>
        <div id="adminProds" class="accordion-collapse collapse" data-bs-parent="#adminAccordion">
          <div class="accordion-body">
            <div id="admin-products"></div>
          </div>
        </div>
      </div>

    </div>
  `;

  renderOrders(app, { containerSelector: "#admin-orders", limit: 10 });
  renderAdminCategories(app, { containerSelector: "#admin-categories" });
  renderAdminProducts(app, { containerSelector: "#admin-products" });
};
