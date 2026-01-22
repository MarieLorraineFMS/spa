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
    <div class="Panel">
      <div class="text-muted small mb-2">Accueil</div>

      ${app.uiState.isAuthenticated
      ? `<h3 class="mb-2">Bienvenue</h3>
             <p class="text-muted mb-0">Lorraine ipsum : tu es “connecté” .</p>`
      : `<h3 class="mb-2">Bienvenue</h3>
             <p class="text-muted mb-0">Clique sur “Se connecter” pour passer en mode authentifié.</p>`
    }
    </div>
  `;
};
