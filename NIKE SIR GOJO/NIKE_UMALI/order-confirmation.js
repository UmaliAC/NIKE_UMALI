
const orders = JSON.parse(localStorage.getItem("nikeOrders") || "[]");

if (orders.length > 0) {
    const order = orders[orders.length - 1];

    document.getElementById("orderNumber").textContent = order.orderNumber;

    document.getElementById("orderTotal").textContent =
        "₱" + order.total.toLocaleString("en-PH");
}