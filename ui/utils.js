/**
 * Helper pour éviter l’injection HTML.
 * @param {any} s
 * @returns {string}
 */
export const escapeHtml = (s) =>
    String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

/**
 * Formatage en euros (FR).
 * @param {number} value
 * @returns {string}
 */
export const formatPrice = (value) => {
    try {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
    } catch {
        return `${Number(value).toFixed(2)} €`;
    }
};

/**
 *
 * @param {any} value
 * @returns {string}
 */
export const formatDate = (value) => {
    const d = value instanceof Date ? value : new Date(value);
    try {
        return new Intl.DateTimeFormat("fr-FR", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(d);
    } catch {
        return String(value);
    }
};
