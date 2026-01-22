/* ////////////////////////////////////////////// SEED (données de départ) ////////////////////////////////////////////// */

export const seedCategories = [
    {
        id: "cat-books",
        name: "Livres",
        color: "#3eb0dc",
        icon: "bi-book",
        imageUrl: "./assets/categories/books.png",
    },
    {
        id: "cat-it",
        name: "Informatique",
        color: "#9b59ff",
        icon: "bi-cpu",
        imageUrl: "./assets/categories/it.png",
    },
    {
        id: "cat-access",
        name: "Accessoires",
        color: "#0d5519",
        icon: "bi-stars",
        imageUrl: "./assets/categories/accessoire.png",
    },
];

export const seedProducts = [
    // ---------------- BOOKS ----------------

    {
        id: "p-1",
        name: "Clean Code",
        price: 29.9,
        stock: 5,
        categoryId: "cat-books",
        imageUrl: "./assets/products/book1.png",
        isFeatured: true,
        shortDescription: "Lorraine ipsum cleanum codum elegant.",
        description:
            "Lorraine ipsum dolor sit amet, cleanum codum refactoris maximus. Lisibilité avant tout, indentation sacrée et fonctions qui ne font qu’une chose, mais bien. Idéal pour calmer l’esprit et éviter les bugs existentiels.",
    },
    {
        id: "p-2",
        name: "Refactoring",
        price: 34.9,
        stock: 3,
        categoryId: "cat-books",
        imageUrl: "./assets/products/book2.png",
        isFeatured: true,
        shortDescription: "Lorraine ipsum refactoris sans douleur.",
        description:
            "Lorraine ipsum dolor sit amet, refactoris tranquillus. On change tout sans rien casser (en théorie). Pour celles et ceux qui aiment ranger leur code comme une étagère parfaitement alignée.",
    },
    {
        id: "p-3",
        name: "Design Patterns",
        price: 39.9,
        stock: 2,
        categoryId: "cat-books",
        imageUrl: "./assets/products/book3.png",
        isFeatured: false,
        shortDescription: "Lorraine ipsum patterns architectura.",
        description:
            "Lorraine ipsum dolor sit amet, singletonus, factoryus et observeris en harmonie. Un grand classique pour comprendre pourquoi ton code ressemble parfois à un plat de spaghetti.",
    },

    // ---------------- IT ----------------

    {
        id: "p-4",
        name: "Clavier mécanique",
        price: 89.0,
        stock: 4,
        categoryId: "cat-it",
        imageUrl: "./assets/products/it1.png",
        isFeatured: true,
        shortDescription: "Lorraine ipsum clic clac satisfactio.",
        description:
            "Lorraine ipsum dolor sit amet, clavierus mécanicus à retour sonore thérapeutique. Chaque frappe est un petit plaisir auditif, validé par les développeurs nocturnes.",
    },
    {
        id: "p-5",
        name: "Souris ergonomique",
        price: 39.0,
        stock: 2,
        categoryId: "cat-it",
        imageUrl: "./assets/products/it2.png",
        isFeatured: false,
        shortDescription: "Lorraine ipsum confortus maximus.",
        description:
            "Lorraine ipsum dolor sit amet, souris ergonomica qui respecte ton poignet et ton karma. Pour coder longtemps sans finir avec une attelle.",
    },
    {
        id: "p-6",
        name: "Hub USB-C",
        price: 24.9,
        stock: 6,
        categoryId: "cat-it",
        imageUrl: "./assets/products/it3.png",
        isFeatured: false,
        shortDescription: "Lorraine ipsum portus multiplicatus.",
        description:
            "Lorraine ipsum dolor sit amet, hubus USB-C qui transforme un port unique en miracle technologique. Indispensable quand tout est branché sauf ce qu’il faut.",
    },

    // ---------------- ACCESSORIES ----------------

    {
        id: "p-7",
        name: "Mug “Debug”",
        price: 12.5,
        stock: 10,
        categoryId: "cat-access",
        imageUrl: "./assets/products/access1.png",
        isFeatured: false,
        shortDescription: "Lorraine ipsum café debuggué.",
        description:
            "Lorraine ipsum dolor sit amet, mugus caffeinus spécial debug matinal. Contient la boisson officielle des bugs corrigés à la dernière minute.",
    },
    {
        id: "p-8",
        name: "Sticker “Ship it”",
        price: 3.0,
        stock: 0,
        categoryId: "cat-access",
        imageUrl: "./assets/products/access2.png",
        isFeatured: false,
        shortDescription: "Lorraine ipsum shipum itum.",
        description:
            "Lorraine ipsum dolor sit amet, stickerus motivantis. À coller après un merge réussi, ou avant, si tu es joueuse.",
    },
    {
        id: "p-9",
        name: "Carnet de notes",
        price: 9.9,
        stock: 7,
        categoryId: "cat-access",
        imageUrl: "./assets/products/access3.png",
        isFeatured: false,
        shortDescription: "Lorraine ipsum idées notabilis.",
        description:
            "Lorraine ipsum dolor sit amet, carnetus analogicus pour noter des idées brillantes, des TODO oubliés et des schémas incompréhensibles sauf pour toi.",
    },
];
