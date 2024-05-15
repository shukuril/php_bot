// Selectors for cart elements
let cartIcon = document.querySelector("#cart-icon");
let cart = document.querySelector(".cart");
let closeCart = document.querySelector("#close-cart");

// Open Cart
cartIcon.addEventListener("click", () => {
    cart.classList.add("active");
});

// Close Cart
closeCart.addEventListener("click", () => {
    cart.classList.remove("active");
});

// Wait for the DOM to load before running the ready function
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", ready);
} else {
    ready();
}

function ready() {
    // Add event listeners to cart remove buttons
    let removeCartButtons = document.querySelectorAll(".cart-remove");
    removeCartButtons.forEach(button => {
        button.addEventListener("click", removeItemFromCart);
    });

    // Add event listeners to quantity inputs
    let quantityInputs = document.querySelectorAll(".cart-quantity");
    quantityInputs.forEach(input => {
        input.addEventListener("change", quantityChanged);
    });

    // Add event listeners to "add to cart" buttons
    let addCartButtons = document.querySelectorAll('.add-cart');
    addCartButtons.forEach(button => {
        button.addEventListener("click", addItemToCart);
    });

    // Add event listener to the buy button
    document.querySelector(".btn-buy").addEventListener("click", buyButtonClicked);

    // Add event listener to filter products by name
    document.getElementById('name-filter').addEventListener('change', function() {
        let filterValue = this.value.toLowerCase();
        let productBoxes = document.querySelectorAll('.product-box');
        productBoxes.forEach(box => {
            let productName = box.querySelector('.product-title').innerText.toLowerCase();
            box.style.display = (filterValue === 'all' || productName === filterValue) ? 'block' : 'none';
        });
    });
}

// Handle the buy button click
function buyButtonClicked() {
    let cartContent = document.querySelector(".cart-content");
    let items = cartContent.querySelectorAll('.cart-box');

    if (items.length === 0) {
        alert("Your cart is empty. Please add items to your cart before proceeding to checkout.");
        return;
    }

    let message = "Order Details:\n";
    items.forEach(item => {
        let imgSrc = item.querySelector('.cart-img').src;
        let title = item.querySelector('.cart-product-title').innerText;
        let price = item.querySelector('.cart-price').innerText;
        let quantity = item.querySelector('.cart-quantity').value;
        let size = item.querySelector('.cart-size').innerText.replace('Size: ', '');
        let color = item.querySelector('.cart-color').innerText.replace('Color: ', '');
        

        message += `\n Image: ${imgSrc}\n  ${title}\n  Price: ${price}\n  Quantity: ${quantity}\n  Size: ${size}\n  Color: ${color}\n`;
    });

    console.log(message);

    // Clear the cart after purchase
    while (cartContent.firstChild) {
        cartContent.removeChild(cartContent.firstChild);
    }

    updateTotal();
}

// Remove an item from the cart
function removeItemFromCart(event) {
    let buttonClicked = event.target;
    buttonClicked.parentElement.remove();
    updateTotal();
}

// Handle quantity changes
function quantityChanged(event) {
    let input = event.target;
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1;
    }
    updateTotal();
}

// Add an item to the cart
function addItemToCart(event) {
    let button = event.target;
    let shopProducts = button.parentElement;
    let title = shopProducts.querySelector(".product-title").innerText;
    let price = shopProducts.querySelector(".price").innerText;
    let productImg = shopProducts.querySelector(".product-img").src;
    let size = shopProducts.querySelector(".size-selector").value;
    let color = shopProducts.querySelector(".color-selector").value;
    let productId = shopProducts.dataset.productId;

    addProductToCart(title, price, productImg, size, color, productId);
    updateTotal();
}

// Add a product to the cart
function addProductToCart(title, price, productImg, size, color, productId) {
    let cartItems = document.querySelector(".cart-content");

    // Create a unique key for each combination of productId, size, and color
    let productKey = productId + '-' + size + '-' + color;
    let cartItemsKeys = cartItems.getElementsByClassName("cart-product-key");

    for (let i = 0; i < cartItemsKeys.length; i++) {
        if (cartItemsKeys[i].innerText.trim() === productKey.trim()) {
            alert("You have already added this item to cart with the same size and color");
            return;
        }
    }

    let cartShopBox = document.createElement("div");
    cartShopBox.classList.add("cart-box");

    let cartBoxContent = `
        <img src="${productImg}" alt="" class="cart-img">
        <div class="detail-box">
            <div class="cart-product-title">${title}</div>
            <div class="cart-price">${price}</div>
            <div class="cart-size">Size: ${size}</div>
            <div class="cart-color">Color: ${color}</div>
            <input type="number" value="1" class="cart-quantity">
        </div>
        <i class='bx bx-trash-alt cart-remove'></i>
        <div class="cart-product-id" style="display: none;">${productId}</div>
        <div class="cart-product-key" style="display: none;">${productKey}</div>
    `;

    cartShopBox.innerHTML = cartBoxContent;
    cartItems.append(cartShopBox);

    // Add event listeners for the new cart item
    cartShopBox.querySelector(".cart-remove").addEventListener("click", removeItemFromCart);
    cartShopBox.querySelector('.cart-quantity').addEventListener("change", quantityChanged);
}

// Update the total price in the cart
function updateTotal() {
    let cartBoxes = document.querySelectorAll('.cart-box');
    let total = 0;
    cartBoxes.forEach(cartBox => {
        let priceElement = cartBox.querySelector('.cart-price');
        let quantityElement = cartBox.querySelector('.cart-quantity');
        let price = parseFloat(priceElement.innerText.replace("sum ", "").replace(",", ""));
        let quantity = quantityElement.value;
        total += price * quantity;
    });
    total = total.toFixed(3);
    document.querySelector(".total-price").innerText = "sum " + total;
}
