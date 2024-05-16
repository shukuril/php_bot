// Селекторы для элементов корзины
let cartIcon = document.querySelector("#cart-icon");
let cart = document.querySelector(".cart");
let closeCart = document.querySelector("#close-cart");
let tg = window.Telegram.WebApp;

// Открыть корзину
cartIcon.addEventListener("click", () => {
    cart.classList.add("active");
});

// Закрыть корзину
closeCart.addEventListener("click", () => {
    cart.classList.remove("active");
});

// Ждем, пока DOM загрузится, прежде чем запускать функцию ready
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", ready);
} else {
    ready();
}

function ready() {
    // Добавляем слушатели событий для кнопок удаления из корзины
    let removeCartButtons = document.querySelectorAll(".cart-remove");
    removeCartButtons.forEach(button => {
        button.addEventListener("click", removeItemFromCart);
    });

    // Добавляем слушатели событий для ввода количества
    let quantityInputs = document.querySelectorAll(".cart-quantity");
    quantityInputs.forEach(input => {
        input.addEventListener("change", quantityChanged);
    });

    // Добавляем слушатели событий для кнопок "добавить в корзину"
    let addCartButtons = document.querySelectorAll('.add-cart');
    addCartButtons.forEach(button => {
        button.addEventListener("click", addItemToCart);
    });

    // Добавляем слушатель событий для кнопки покупки
    document.querySelector(".btn-buy").addEventListener("click", buyButtonClicked);

    // Добавляем слушатель событий для фильтрации продуктов по имени
    document.getElementById('name-filter').addEventListener('change', function() {
        let filterValue = this.value.toLowerCase();
        let productBoxes = document.querySelectorAll('.product-box');
        productBoxes.forEach(box => {
            let productName = box.querySelector('.product-title').innerText.toLowerCase();
            box.style.display = (filterValue === 'all' || productName === filterValue) ? 'block' : 'none';
        });
    });
}

// Обработка нажатия кнопки покупки
function buyButtonClicked() {
    let cartContent = document.querySelector(".cart-content");
    let items = cartContent.querySelectorAll('.cart-box');

    // Проверка на пустую корзину
    if (items.length === 0) {
        alert("Ваша корзина пуста. Пожалуйста, добавьте товары в корзину перед оформлением заказа.");
        return;
    }

    // Формирование сообщения с деталями заказа
    let message = "Детали заказа:\n";
    items.forEach(item => {
        let imgSrc = item.querySelector('.cart-img').src;
        let title = item.querySelector('.cart-product-title').innerText;
        let price = item.querySelector('.cart-price').innerText;
        let quantity = item.querySelector('.cart-quantity').value;
        let size = item.querySelector('.cart-size').innerText.replace('Size: ', '');
        let color = item.querySelector('.cart-color').innerText.replace('Color: ', '');

        message += `\n\n\tИзображение: ${imgSrc}\n\n\tНазвание: ${title}\n\n\tЦена: ${price}\n\n\tКоличество: ${quantity}\n\n\tРазмер: ${size}\n\n\tЦвет: ${color}\n`;
    });

    Telegram.WebApp.onEvent(buyButtonClicked, function(){
        tg.sendData(message);
    });
}

// Удаление товара из корзины
function removeItemFromCart(event) {
    let buttonClicked = event.target;
    buttonClicked.parentElement.remove();
    updateTotal();
}

// Обработка изменения количества товаров
function quantityChanged(event) {
    let input = event.target;
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1;
    }
    updateTotal();
}

// Добавление товара в корзину
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

// Добавление продукта в корзину
function addProductToCart(title, price, productImg, size, color, productId) {
    let cartItems = document.querySelector(".cart-content");

    // Создание уникального ключа для каждой комбинации productId, size и color
    let productKey = productId + '-' + size + '-' + color;
    let cartItemsKeys = cartItems.getElementsByClassName("cart-product-key");

    for (let i = 0; i < cartItemsKeys.length; i++) {
        if (cartItemsKeys[i].innerText.trim() === productKey.trim()) {
            alert("Вы уже добавили этот товар в корзину с таким же размером и цветом");
            return;
        }
    }

    // Создание нового элемента корзины
    let cartShopBox = document.createElement("div");
    cartShopBox.classList.add("cart-box");

    let cartBoxContent = `
        <img src="${productImg}" alt="" class="cart-img">
        <div class="detail-box">
            <div class="cart-product-title">${title}</div>
            <div class="cart-price">${price}</div>
            <div class="cart-size">Размер: ${size}</div>
            <div class="cart-color">Цвет: ${color}</div>
            <input type="number" value="1" class="cart-quantity">
        </div>
        <i class='bx bx-trash-alt cart-remove'></i>
        <div class="cart-product-id" style="display: none;">${productId}</div>
        <div class="cart-product-key" style="display: none;">${productKey}</div>
    `;

    cartShopBox.innerHTML = cartBoxContent;
    cartItems.append(cartShopBox);

    // Добавление слушателей событий для нового элемента корзины
    cartShopBox.querySelector(".cart-remove").addEventListener("click", removeItemFromCart);
    cartShopBox.querySelector('.cart-quantity').addEventListener("change", quantityChanged);
}

// Обновление общей цены в корзине
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
