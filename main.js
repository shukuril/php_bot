// Получение элементов корзины
let cartIcon = document.querySelector("#cart-icon");
let cart = document.querySelector(".cart");
let closeCart = document.querySelector("#close-cart");

// Открытие корзины
cartIcon.addEventListener("click", () => {
    cart.classList.add("active");
});

// Закрытие корзины
closeCart.onclick = () => {
    cart.classList.remove("active");
};

// Работа с корзиной
if (document.readyState == 'loading') {
    document.addEventListener("DOMContentLoaded", ready);
} else {
    ready();
}

// Функция инициализации
function ready() {
    // Удаление товара из корзины
    var removeCartButtons = document.getElementsByClassName("cart-remove");
    for (var i = 0; i < removeCartButtons.length; i++) {
        var button = removeCartButtons[i];
        button.addEventListener("click", removeItemFromCart);
    }

    // Изменение количества товара
    var quantityInputs = document.getElementsByClassName("cart-quantity");
    for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i];
        input.addEventListener("change", quantityChanged);
    }

    // Добавление товара в корзину
    var addCart = document.getElementsByClassName('add-cart');
    for (var i = 0; i < addCart.length; i++) {
        var button = addCart[i];
        button.addEventListener("click", addItemToCart);
    }

    // Обработчик кнопки покупки
    document
        .getElementsByClassName("btn-buy")[0]
        .addEventListener("click", buyButtonClicked);

    // Фильтрация товаров по названию
    document.getElementById('name-filter').addEventListener('change', function() {
        var filterValue = this.value.toLowerCase();
        var productBoxes = document.querySelectorAll('.product-box');
        productBoxes.forEach(function(box) {
            var productName = box.querySelector('.product-title').innerText.toLowerCase();
            if (filterValue === 'all' || productName === filterValue) {
                box.style.display = 'block';
            } else {
                box.style.display = 'none';
            }
        });
    });
}

// Функция открытия формы заказа
function openOrderForm() {
    document.querySelector('.order-form').style.display = 'block';
}

// Обработчик кнопки покупки
function buyButtonClicked() {
    var cartContent = document.querySelector(".cart-content");
    var items = cartContent.querySelectorAll('.cart-box');

    if (items.length === 0) {
        alert("Your cart is empty. Please add items to your cart before proceeding to checkout.");
        return;
    }

    var orderDetails = [];

    items.forEach(function(item) {
        var title = item.querySelector('.cart-product-title').innerText;
        var price = item.querySelector('.cart-price').innerText;
        var quantity = item.querySelector('.cart-quantity').value;
        var size = item.querySelector('.cart-size').innerText;
        var color = item.querySelector('.cart-color').innerText;
        var imageSrc = item.querySelector('.cart-img').getAttribute('src');
        var productId = item.querySelector('.cart-product-id').innerText;

        orderDetails.push({
            title: title,
            price: price,
            quantity: quantity,
            size: size,
            color: color,
            imageSrc: imageSrc,
            productId: productId
        });
    });

    // Отправка данных заказа на Python
    window.pywebview.api.submitOrder(orderDetails)
        .then(response => {
            console.log('Success:', response);
            alert("Order submitted successfully!");
            // Очистка корзины
            while (cartContent.firstChild) {
                cartContent.removeChild(cartContent.firstChild);
            }
            updateTotal();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert("There was an error submitting your order. Please try again.");
        });
}

// Удаление товара из корзины
function removeItemFromCart(event) {
    var buttonClicked = event.target;
    buttonClicked.parentNode.remove();
    updateTotal();
}

// Изменение количества товара
function quantityChanged(event) {
    var input = event.target;
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1;
    }
    updateTotal();
}

// Добавление товара в корзину
function addItemToCart(event) {
    var button = event.target;
    var shopProducts = button.parentElement;
    var title = shopProducts.querySelector(".product-title").innerText;
    var price = shopProducts.querySelector(".price").innerText;
    var productImg = shopProducts.querySelector(".product-img").src;
    var size = shopProducts.querySelector(".size-selector").value;
    var color = shopProducts.querySelector(".color-selector").value;
    var productId = shopProducts.dataset.productId;

    addProductToCart(title, price, productImg, size, color, productId);
    updateTotal();
}

// Добавление продукта в корзину
function addProductToCart(title, price, productImg, size, color, productId) {
    var cartShopBox = document.createElement("div");
    cartShopBox.classList.add("cart-box");
    var cartItems = document.querySelector(".cart-content");
    var cartItemsData = cartItems.getElementsByClassName("cart-box");
    
    for (var i = 0; i < cartItemsData.length; i++) {
        var itemId = cartItemsData[i].querySelector(".cart-product-id").innerText.trim();
        var itemSize = cartItemsData[i].querySelector(".cart-size").innerText.trim();
        var itemColor = cartItemsData[i].querySelector(".cart-color").innerText.trim();
        if (itemId === productId.trim() && itemSize === size && itemColor === color) {
            alert("You have already added this item with the same size and color to the cart");
            return;
        }
    }

    var cartBoxContent = `
        <img src="${productImg}" alt="" class="cart-img">
        <div class="detail-box">
            <div class="cart-product-title">${title}</div>
            <div class="cart-price">${price}</div>
            <div class="cart-size">${size}</div>
            <div class="cart-color">${color}</div>
            <input type="number" value="1" class="cart-quantity">
        </div>
        <!-- Remove Cart -->
        <i class='bx bx-trash-alt cart-remove'></i>
        <div class="cart-product-id" style="display: none;">${productId}</div>
    `;
    
    cartShopBox.innerHTML = cartBoxContent;
    cartItems.append(cartShopBox);

    cartShopBox.getElementsByClassName("cart-remove")[0].addEventListener("click", removeItemFromCart);
    cartShopBox.querySelector('.cart-quantity').addEventListener("change", quantityChanged);
}

// Обновление общей суммы
function updateTotal() {
    var cartBoxes = document.querySelectorAll('.cart-box');
    var total = 0;
    for (var i = 0; i < cartBoxes.length; i++) {
        var cartBox = cartBoxes[i];
        var priceElement = cartBox.querySelector('.cart-price');
        var quantityElement = cartBox.querySelector('.cart-quantity');
        var price = parseFloat(priceElement.innerText.replace("sum ", "").replace(",", ""));
        var quantity = quantityElement.value;
        total += price * quantity;
    }
    total = total.toFixed(3);
    document.querySelector(".total-price").innerText = "sum " + total;
}
