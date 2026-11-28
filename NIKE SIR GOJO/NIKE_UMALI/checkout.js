const savedUser = JSON.parse(localStorage.getItem("nikeUser") || "null");

if (localStorage.getItem("nikeLoggedIn") !== "true" || !savedUser || !savedUser.email) {
    window.location.href = "login.html";
}

const cartStorageKey = "nikeCart_" + savedUser.email.toLowerCase();
let cart = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");

const checkoutItems = document.getElementById("checkoutItems");
const checkoutSubtotal = document.getElementById("checkoutSubtotal");
const shippingFee = document.getElementById("shippingFee");
const checkoutTotal = document.getElementById("checkoutTotal");

const SHIPPING_FEE = 150;

function renderCheckout() {

    if (cart.length === 0) {
        alert("Your cart is empty!");
        window.location.href = "cart.html";
        return;
    }

    let subtotal = 0;
    checkoutItems.innerHTML = "";

    cart.forEach(item => {

        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const product = document.createElement("p");
        product.textContent = `${item.name} x ${item.quantity} - ₱${itemTotal.toLocaleString("en-PH")}`;

        checkoutItems.appendChild(product);
    });

    const total = subtotal + SHIPPING_FEE;

    checkoutSubtotal.textContent = "₱" + subtotal.toLocaleString("en-PH");
    shippingFee.textContent = "₱" + SHIPPING_FEE.toLocaleString("en-PH");
    checkoutTotal.textContent = "₱" + total.toLocaleString("en-PH");
}

document.getElementById("email").value = savedUser.email;

document.getElementById("checkoutForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const order = {
        orderNumber: "NIKE-" + Date.now(),
        customer: {
            fullName: document.getElementById("fullName").value,
            phone: document.getElementById("phone").value,
            email: document.getElementById("email").value
        },
        address: {
            street: document.getElementById("street").value,
            barangay: document.getElementById("barangay").value,
            city: document.getElementById("city").value,
            province: document.getElementById("province").value,
            zip: document.getElementById("zip").value
        },
        paymentMethod: "Cash on Delivery",
        items: cart,
        subtotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        shippingFee: SHIPPING_FEE,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + SHIPPING_FEE,
        orderDate: new Date().toISOString()
    };

    const orders = JSON.parse(localStorage.getItem("nikeOrders") || "[]");

    orders.push(order);

    localStorage.setItem("nikeOrders", JSON.stringify(orders));
    localStorage.setItem(cartStorageKey, "[]");

    window.location.href = "order-confirmation.html";
});

renderCheckout();
