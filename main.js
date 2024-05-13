// Cart
let cartIcon = document.querySelector("#cart-icon");
let cart = document.querySelector(".cart");
let closeCart = document.querySelector("#close-cart");

// Open Cart
cartIcon.addEventListener("click", () => {
    cart.classList.add("active");
});

// Close Cart
closeCart.onclick = () => {
    cart.classList.remove("active");
};

// Cart Working JS
if (document.readyState == 'loading') {
    document.addEventListener("DOMContentLoaded", ready);
} else {
    ready();
}

// Making Function
function ready() {
    // Remove Item From Cart
    var removeCartButtons = document.getElementsByClassName("cart-remove");
    for (var i = 0; i < removeCartButtons.length; i++) {
        var button = removeCartButtons[i];
        button.addEventListener("click", removeItemFromCart);
    }

    // Quantity Changes
    var quantityInputs = document.getElementsByClassName("cart-quantity");
    for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i];
        input.addEventListener("change", quantityChanged);
    }

    // Add To Cart
    var addCart = document.getElementsByClassName('add-cart');
    for (var i = 0; i < addCart.length; i++) {
        var button = addCart[i];
        button.addEventListener("click", addItemToCart);
    }

    // Buy button Work
    document
        .getElementsByClassName("btn-buy")[0]
        .addEventListener("click", openOrderForm);

    // Submit Order
    document.querySelector('#submit-order').addEventListener('click', function() {
        var name = document.querySelector('#name').value;
        var phoneNumber = document.querySelector('#phone').value;
        var address = document.querySelector('#address').value;

        // Проверяем, все ли обязательные поля заполнены
        if (name.trim() === '' || phoneNumber.trim() === '' || address.trim() === '') {
            alert("Please fill in all required fields (name, phone number, address) before submitting.");
            return; // Отменяем отправку формы
        }

        console.log('Name:', name);
        console.log('Phone Number:', phoneNumber);
        console.log('Address:', address);

        document.querySelector('#name').value = '';
        document.querySelector('#phone').value = '';
        document.querySelector('#address').value = '';

        document.querySelector('.order-form').style.display = 'none';
    });

    // Close Order Form
    document.querySelector('#close-form').addEventListener('click', function() {
        document.querySelector('.order-form').style.display = 'none';
    });

    // Filter Products by Name
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

    // Add event listener for name filter change
    document.getElementById('name-filter').addEventListener('change', function() {
        var selectedName = this.value;
        filterProductsByName(selectedName);
    });

    // Объединенный код
    $('.telegram-form').on('submit', function (event) {

        event.stopPropagation();
        event.preventDefault();

        // Функция для получения данных из корзины
        function getCartData() {
            // Ваш код для получения данных из корзины
            // Например:
            let cartData = {
                'productImg': '${productImg}',
                'title': '${title}',
                'price': '${price}',
                'size': '${size}',
                'color': '${color}',
                'productId': '${productId}',
                // Другие данные корзины
            };
            return cartData;
        }

        let form = this,
            submit = $('.submit', form),
            data = new FormData(),
            files = $('input[type=file]')

        $('.submit', form).val('Отправка...');
        $('input, textarea', form).attr('disabled','');

        data.append( 'name',         $('[id="name"]', form).val() );
        data.append( 'phone',        $('[id="phone"]', form).val() );
        data.append( 'address',      $('[id="address"]', form).val() );

        // Получение данных из корзины
        let cartData = getCartData();

        // Добавление данных из корзины в FormData
        for (let key in cartData) {
            data.append(key, cartData[key]);
        }

        files.each(function (key, file) {
            let cont = file.files;
            if ( cont ) {
                $.each( cont, function( key, value ) {
                    data.append( key, value );
                });
            }
        });
        
        $.ajax({
            url: 'app.py',
            type: 'POST',
            data: data,
            cache: false,
            dataType: 'json',
            processData: false,
            contentType: false,
            xhr: function() {
                let myXhr = $.ajaxSettings.xhr();

                if ( myXhr.upload ) {
                    myXhr.upload.addEventListener( 'progress', function(e) {
                        if ( e.lengthComputable ) {
                            let percentage = ( e.loaded / e.total ) * 100;
                                percentage = percentage.toFixed(0);
                            $('.submit', form)
                                .html( percentage + '%' );
                        }
                    }, false );
                }

                return myXhr;
            },
            error: function( jqXHR, textStatus ) {
                // Тут выводим ошибку
            },
            complete: function() {
                // Тут можем что-то делать ПОСЛЕ успешной отправки формы
                console.log('Complete')
                form.reset() 
            }
        });

        return false;
    });
}

// Open Order Form
function openOrderForm() {
    document.querySelector('.order-form').style.display = 'block';
}

// Buy Button
function buyButtonClicked() {
    var cartContent = document.querySelector(".cart-content");
    var items = cartContent.querySelectorAll('.cart-box');

    if (items.length === 0) {
        alert("Your cart is empty. Please add items to your cart before proceeding to checkout.");
        return;
    }

    var message = "Order Details:\n";

    items.forEach(function(item) {
        var title = item.querySelector('.cart-product-title').innerText;
        var price = item.querySelector('.cart-price').innerText;
        var quantity = item.querySelector('.cart-quantity').value;

        message += `${title} - ${price} x ${quantity}\n`;
    });

    console.log(message);

    while (cartContent.firstChild) {
        cartContent.removeChild(cartContent.firstChild);
    }

    updateTotal();
}

// Remove Items From Cart
function removeItemFromCart(event) {
    var buttonClicked = event.target;
    buttonClicked.parentNode.remove();
    updateTotal();
}
// Quantity Changes
function quantityChanged(event) {
    var input = event.target;
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1;
    }
    updateTotal();
}

// Add To Cart
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
    updateTotal(); // Добавлено здесь
}

// Add Product To Cart
function addProductToCart(title, price, productImg, size, color, productId) {
    var cartShopBox = document.createElement("div");
    cartShopBox.classList.add("cart-box");
    var cartItems = document.querySelector(".cart-content");
    var cartItemsIds = cartItems.getElementsByClassName("cart-product-id");
    for (var i = 0; i < cartItemsIds.length; i++) {
        if (cartItemsIds[i].innerText.trim() === productId.trim()) {
            alert("You have already added this item to cart");
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

    cartShopBox
        .getElementsByClassName("cart-remove")[0]
        .addEventListener("click", removeItemFromCart);

    cartShopBox
        .querySelector('.cart-quantity')
        .addEventListener("change", quantityChanged);
}

// Update Total
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
    document.querySelector(".total-price").innerText = "sum " + total; // Обновляем значение общей суммы
}
