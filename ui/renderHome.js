/**
 * Home.
 * @param {object} app
 * @param {object} [options]
 * @param {string} [options.containerSelector]
 */
export const renderHome = (app, { containerSelector = "#client-home" } = {}) => {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = `



      ${app.uiState.isAuthenticated
      ? `<h3 class="mb-2">Home & auth</h3>
             `
      : `<h3 class="mb-2">Home & !auth</h3>
           `
    }

  `;
};
