export class OrderLine {
    constructor({ productId, productName, unitPrice, quantity }) {

        this.productId = productId;
        this.productName = productName;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
    }

    /**
     *
     * Calculer le sous-total d'une ligne de commande
     * @returns {void}
     */
    getLineTotal() {
        return this.unitPrice * this.quantity;
    }
}
