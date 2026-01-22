export class CartItem {
    constructor({ productId, unitPrice, quantity, imageUrl }) {
        this.productId = productId;
        this.quantity = Number(quantity);
        this.unitPrice = Number(unitPrice);
        this.imageUrl = imageUrl

    }

    /**
     *
     * Calculer le sous-total d'une ligne du panier
     * @returns {number}
     */
    getLineTotal() {
        return this.unitPrice * this.quantity;
    }
}
