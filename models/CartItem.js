export class CartItem {
    constructor({ productId, unitPrice, quantity }) {
        this.productId = productId;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
    }

    /**
     *
     * Calculer le sous-total d'une ligne du panier
     * @returns {void}
     */
    getLineTotal() {
        return this.unitPrice * this.quantity;
    }
}
