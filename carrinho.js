const CART_KEY = "petlandiaCarrinho";


const FRETE = 19.90;


const VALOR_FRETE_GRATIS = 99.00;



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




function saveCart(cart) {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}



function formatPrice(value) {

    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}




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


   

    if (totalItems === 0) {

        badge.style.display = "none";

    } else {

        badge.style.display = "flex";

    }

}





function addToCart(product) {

    const cart = getCart();


  

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


  

    showCartNotification(
        product.name + " foi adicionado ao carrinho!"
    );

}





function removeFromCart(productId) {

    let cart = getCart();


    cart = cart.filter(
        product => product.id !== productId
    );


    saveCart(cart);

    renderCart();

    updateCartBadge();

}





function changeQuantity(productId, change) {

    const cart = getCart();


    const product = cart.find(
        item => item.id === productId
    );


    if (!product) {
        return;
    }


    product.quantity += change;


   

    if (product.quantity <= 0) {

        removeFromCart(productId);

        return;

    }


    saveCart(cart);

    renderCart();

    updateCartBadge();

}





function calculateSubtotal(cart) {

    return cart.reduce(

        (total, product) => {

            return total +
                (product.price * product.quantity);

        },

        0

    );

}





function calculateShipping(subtotal) {

    if (subtotal <= 0) {

        return 0;

    }


   

    if (subtotal >= VALOR_FRETE_GRATIS) {

        return 0;

    }


    return FRETE;

}





function renderCart() {

    const cartItems = document.getElementById("cartItems");

    const emptyCart = document.getElementById("emptyCart");

    const cartItemCount = document.getElementById("cartItemCount");


    if (!cartItems) {
        return;
    }


    const cart = getCart();


   

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


    

    updateSummary(cart);

}




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


   

    const checkoutButton =
        document.getElementById("checkoutButton");


    if (checkoutButton) {

        checkoutButton.disabled =
            cart.length === 0;

    }

}





function showCartNotification(message) {


   
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




document.addEventListener(
    "DOMContentLoaded",
    function () {


        

        renderCart();


        

        updateCartBadge();


       

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




updateCartBadge();
