/* =========================================
   PETLÂNDIA - SISTEMA DE CARRINHO
========================================= */


/* =========================================
   CONFIGURAÇÕES
========================================= */

const CART_KEY = "petlandiaCarrinho";


// Frete padrão
const FRETE = 19.90;


// Valor mínimo para frete grátis
const VALOR_FRETE_GRATIS = 99.00;



/* =========================================
   PEGAR CARRINHO
========================================= */

function getCart() {

    const cart = localStorage.getItem(CART_KEY);

    if (!cart) {
        return [];
    }

    try {

        return JSON.parse(cart);

    } catch (error) {

        console.error("Erro ao carregar carrinho:", error);

        return [];

    }

}



/* =========================================
   SALVAR CARRINHO
========================================= */

function saveCart(cart) {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}



/* =========================================
   FORMATAR PREÇO
========================================= */

function formatPrice(value) {

    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}



/* =========================================
   ATUALIZAR BADGE
========================================= */

function updateCartBadge() {

    const badge = document.getElementById("cartBadge");

    if (!badge) {
        return;
    }


    const cart = getCart();


    const totalItems = cart.reduce(
        (total, product) => total + product.quantity,
        0
    );


    badge.textContent = totalItems;


    /*
       Se não houver produtos,
       podemos esconder o número.
    */

    if (totalItems === 0) {

        badge.style.display = "none";

    } else {

        badge.style.display = "flex";

    }

}



/* =========================================
   ADICIONAR PRODUTO
========================================= */

function addToCart(product) {

    const cart = getCart();


    /*
       Procuramos pelo ID.
    */

    const existingProduct = cart.find(
        item => item.id === product.id
    );


    if (existingProduct) {

        existingProduct.quantity += 1;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            description: product.description || "",

            price: Number(product.price),

            image: product.image || "",

            quantity: 1

        });

    }


    saveCart(cart);

    updateCartBadge();


    /*
       Pequeno aviso visual.
    */

    showCartNotification(
        product.name + " foi adicionado ao carrinho!"
    );

}



/* =========================================
   REMOVER PRODUTO
========================================= */

function removeFromCart(productId) {

    let cart = getCart();


    cart = cart.filter(
        product => product.id !== productId
    );


    saveCart(cart);

    renderCart();

    updateCartBadge();

}



/* =========================================
   ALTERAR QUANTIDADE
========================================= */

function changeQuantity(productId, change) {

    const cart = getCart();


    const product = cart.find(
        item => item.id === productId
    );


    if (!product) {
        return;
    }


    product.quantity += change;


    /*
       Se chegar a zero,
       removemos o produto.
    */

    if (product.quantity <= 0) {

        removeFromCart(productId);

        return;

    }


    saveCart(cart);

    renderCart();

    updateCartBadge();

}



/* =========================================
   CALCULAR SUBTOTAL
========================================= */

function calculateSubtotal(cart) {

    return cart.reduce(

        (total, product) => {

            return total +
                (product.price * product.quantity);

        },

        0

    );

}



/* =========================================
   CALCULAR FRETE
========================================= */

function calculateShipping(subtotal) {

    if (subtotal <= 0) {

        return 0;

    }


    /*
       Frete grátis acima de R$ 99.
    */

    if (subtotal >= VALOR_FRETE_GRATIS) {

        return 0;

    }


    return FRETE;

}



/* =========================================
   RENDERIZAR CARRINHO
========================================= */

function renderCart() {

    const cartItems = document.getElementById("cartItems");

    const emptyCart = document.getElementById("emptyCart");

    const cartItemCount = document.getElementById("cartItemCount");


    if (!cartItems) {
        return;
    }


    const cart = getCart();


    /*
       CARRINHO VAZIO
    */

    if (cart.length === 0) {

        cartItems.innerHTML = "";

        cartItems.style.display = "none";

        emptyCart.style.display = "block";


        if (cartItemCount) {
            cartItemCount.textContent = "0 itens";
        }


        updateSummary(cart);

        return;

    }


    /*
       CARRINHO COM PRODUTOS
    */

    cartItems.style.display = "block";

    emptyCart.style.display = "none";


    cartItems.innerHTML = "";


    cart.forEach(product => {


        const item = document.createElement("div");

        item.className = "cart-item";


        item.innerHTML = `

            <div class="cart-item-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    onerror="this.style.display='none';"
                >

            </div>


            <div class="cart-item-info">

                <h4>
                    ${product.name}
                </h4>

                <p>
                    ${product.description || "Produto PetLândia"}
                </p>

                <span class="cart-item-price">
                    ${formatPrice(product.price)}
                </span>

            </div>


            <div class="cart-item-actions">

                <div class="quantity-control">

                    <button
                        type="button"
                        onclick="changeQuantity('${product.id}', -1)">

                        <i class="fa-solid fa-minus"></i>

                    </button>


                    <span>
                        ${product.quantity}
                    </span>


                    <button
                        type="button"
                        onclick="changeQuantity('${product.id}', 1)">

                        <i class="fa-solid fa-plus"></i>

                    </button>

                </div>


                <button
                    type="button"
                    class="remove-product"
                    onclick="removeFromCart('${product.id}')">

                    <i class="fa-solid fa-trash"></i>

                    Remover

                </button>

            </div>

        `;


        cartItems.appendChild(item);

    });


    /*
       CONTADOR
    */

    const totalItems = cart.reduce(
        (total, product) => total + product.quantity,
        0
    );


    if (cartItemCount) {

        cartItemCount.textContent =
            totalItems === 1
                ? "1 item"
                : `${totalItems} itens`;

    }


    /*
       ATUALIZA RESUMO
    */

    updateSummary(cart);

}



/* =========================================
   ATUALIZAR RESUMO
========================================= */

function updateSummary(cart) {

    const subtotalElement =
        document.getElementById("subtotal");


    const shippingElement =
        document.getElementById("shipping");


    const totalElement =
        document.getElementById("total");


    const shippingMessage =
        document.getElementById("shippingMessage");


    if (!subtotalElement ||
        !shippingElement ||
        !totalElement) {

        return;

    }


    const subtotal =
        calculateSubtotal(cart);


    const shipping =
        calculateShipping(subtotal);


    const total =
        subtotal + shipping;


    subtotalElement.textContent =
        formatPrice(subtotal);


    shippingElement.textContent =
        shipping === 0 && subtotal > 0
            ? "Grátis"
            : formatPrice(shipping);


    totalElement.textContent =
        formatPrice(total);


    /*
       MENSAGEM DO FRETE
    */

    if (shippingMessage) {


        if (subtotal === 0) {

            shippingMessage.innerHTML = `

                <i class="fa-solid fa-truck"></i>

                <span>
                    Adicione produtos para calcular o frete.
                </span>

            `;

        }


        else if (subtotal < VALOR_FRETE_GRATIS) {

            const remaining =
                VALOR_FRETE_GRATIS - subtotal;


            shippingMessage.innerHTML = `

                <i class="fa-solid fa-truck"></i>

                <span>
                    Faltam
                    <strong>${formatPrice(remaining)}</strong>
                    para você ganhar frete grátis!
                </span>

            `;

        }


        else {

            shippingMessage.innerHTML = `

                <i class="fa-solid fa-truck"></i>

                <span>
                    🎉 Você ganhou frete grátis!
                </span>

            `;

        }

    }


    /*
       BOTÃO DE FINALIZAR
    */

    const checkoutButton =
        document.getElementById("checkoutButton");


    if (checkoutButton) {

        checkoutButton.disabled =
            cart.length === 0;

    }

}



/* =========================================
   NOTIFICAÇÃO
========================================= */

function showCartNotification(message) {


    /*
       Verifica se já existe
    */

    let notification =
        document.getElementById("cartNotification");


    if (!notification) {

        notification =
            document.createElement("div");


        notification.id =
            "cartNotification";


        notification.style.position =
            "fixed";

        notification.style.bottom =
            "25px";

        notification.style.right =
            "25px";

        notification.style.background =
            "#511395";

        notification.style.color =
            "#fff";

        notification.style.padding =
            "14px 20px";

        notification.style.borderRadius =
            "10px";

        notification.style.boxShadow =
            "0 8px 25px rgba(0,0,0,0.2)";

        notification.style.zIndex =
            "99999";

        notification.style.fontSize =
            "14px";

        notification.style.fontWeight =
            "600";

        notification.style.transition =
            "0.3s";


        document.body.appendChild(
            notification
        );

    }


    notification.textContent =
        message;


    notification.style.opacity =
        "1";


    setTimeout(() => {

        notification.style.opacity =
            "0";

    }, 2500);

}



/* =========================================
   MODAL DE CHECKOUT
========================================= */

function openCheckoutModal() {

    const cart = getCart();


    if (cart.length === 0) {

        return;

    }


    const modal =
        document.getElementById("checkoutModal");


    if (modal) {

        modal.classList.add("show");

    }

}



function closeCheckoutModal() {

    const modal =
        document.getElementById("checkoutModal");


    if (modal) {

        modal.classList.remove("show");

    }

}



/* =========================================
   INICIALIZAÇÃO
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /*
           Atualiza o carrinho
        */

        renderCart();


        /*
           Atualiza número do carrinho
        */

        updateCartBadge();


        /*
           Botão finalizar compra
        */

        const checkoutButton =
            document.getElementById(
                "checkoutButton"
            );


        if (checkoutButton) {

            checkoutButton.addEventListener(
                "click",
                openCheckoutModal
            );

        }


        /*
           Fechar modal
        */

        const closeModal =
            document.getElementById(
                "closeModal"
            );


        if (closeModal) {

            closeModal.addEventListener(
                "click",
                closeCheckoutModal
            );

        }


        /*
           Botão "Entendi"
        */

        const modalOk =
            document.getElementById(
                "modalOk"
            );


        if (modalOk) {

            modalOk.addEventListener(
                "click",
                closeCheckoutModal
            );

        }


        /*
           Clicar fora do modal
        */

        const modal =
            document.getElementById(
                "checkoutModal"
            );


        if (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (event.target === modal) {

                        closeCheckoutModal();

                    }

                }
            );

        }

    }
);



/* =========================================
   ATUALIZAR BADGE EM OUTRAS PÁGINAS
========================================= */

updateCartBadge();