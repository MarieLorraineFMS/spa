/**
 * StockService
 * - Vérifie si un produit ajouté au panier est en stock
 * - Applique les changements de stock à la confirmation/validation d'une commande
 */
export class StockService {
    /**
     * Vérifier la disponibilité d'un produit
     * @param {Cart} cart
     * @param {CatalogService} catalogService
     * @returns {{ ok: true } | { ok: false, reason: string, missing: Array<{productId: string, requested: number, available: number}> }}
     */
    canFulfill(cart, catalogService) {
        if (!cart) {
            throw new Error("StockService.canFulfill: cart is required");
        }
        if (!catalogService) {
            throw new Error("StockService.canFulfill: catalogService is required");
        }

        const missing = [];

        // Vérifie le stock pour chaque objet dans le caddie
        for (const item of cart.items) {
            const product = catalogService.getProductById(item.productId);

            // Indisponible
            if (!product) {
                missing.push({
                    productId: item.productId,
                    requested: item.quantity,
                    available: 0,
                });
                continue;
            }

            const available = product.stock;
            // Disponible
            if (available < item.quantity) {
                missing.push({
                    productId: item.productId,
                    requested: item.quantity,
                    available,
                });
            }
        }

        // Quantité insuffisante
        if (missing.length > 0) {
            return {
                ok: false,
                reason: "INSUFFICIENT_STOCK",
                missing,
            };
        }

        return { ok: true };
    }

    /**
     * Modifie le stock suivant la quantité dans le panier
     *
     * @param {Cart} cart
     * @param {CatalogService} catalogService
     * @returns {void}
     */
    applyCartStock(cart, catalogService) {
        const check = this.canFulfill(cart, catalogService);
        if (!check.ok) {
            throw new Error("StockService.applyCartStock: cannot fulfill cart");
        }

        // Modifier le stock pour chaque ligne du panier
        for (const item of cart.items) {
            catalogService.decreaseStock(item.productId, item.quantity);
        }
    }
}
