
/* PASSWORD VISIBILITY */

document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", function () {
        const input = document.getElementById(this.dataset.toggle);

        if (input.type === "password") {
            input.type = "text";
        } else {
            input.type = "password";
        }
    });
});


/* SIGN UP */

const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("fullName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const terms = document.getElementById("agreeTerms").checked;
        const message = document.getElementById("signupMessage");

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            return;
        }

        if (!terms) {
            message.textContent = "Please agree to the terms.";
            return;
        }

        try {
            message.textContent = "Creating your account...";

            const response = await fetch("http://localhost:3000/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.message;
                return;
            }

            localStorage.setItem("nikeEmail", email);

            window.location.href = "verification.html";

        } catch (error) {
            message.textContent = "Unable to connect to the server. Please try again.";
            console.error("Signup Error:", error);
        }
    });
}

/* LOGIN */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("loginMessage");

        try {
            message.textContent = "Logging in...";

            const response = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.message;
                return;
            }

            localStorage.setItem("nikeLoggedIn", "true");
            localStorage.setItem("nikeUser", JSON.stringify(data.user));

            window.location.href = "dashboard.html";

        } catch (error) {
            message.textContent = "Unable to connect to the server. Please try again.";
            console.error("Login Error:", error);
        }
    });
}

/* FORGOT PASSWORD */

const forgotPassword = document.getElementById("forgotPassword");

if (forgotPassword) {
    forgotPassword.addEventListener("click", function (event) {
        event.preventDefault();

        document.getElementById("loginMessage").textContent =
            "Password reset requires email service integration.";
    });
}


/* SOCIAL LOGIN */

document.querySelectorAll("[data-social]").forEach(button => {
    button.addEventListener("click", function () {
        alert(this.dataset.social + " login requires additional setup.");
    });
});


/* EMAIL VERIFICATION PAGE */

const verificationEmail = document.getElementById("verificationEmail");

if (verificationEmail) {
    const email = localStorage.getItem("nikeEmail");

    verificationEmail.textContent = email || "No email found.";

    const verificationForm = document.getElementById("verificationForm");
    const otpBoxes = document.querySelectorAll(".otp-box");
    const verificationCode = document.getElementById("verificationCode");
    const message = document.getElementById("verificationMessage");

    // Keep all six boxes synchronized with one verification code
    function updateVerificationCode() {
    const enteredCode = Array.from(otpBoxes)
        .map(box => box.value.trim())
        .join("");

    verificationCode.value = enteredCode;

    console.log("OTP INPUT UPDATED. DIGITS ENTERED:", enteredCode.length);
}

    // Automatically move between boxes
    otpBoxes.forEach((box, index) => {

        box.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "").slice(-1);

            updateVerificationCode();

            if (this.value && index < otpBoxes.length - 1) {
                otpBoxes[index + 1].focus();
            }
        });

        // Backspace and arrow navigation
        box.addEventListener("keydown", function (event) {

            if (event.key === "Backspace" && !this.value && index > 0) {
                otpBoxes[index - 1].focus();
            }

            if (event.key === "ArrowLeft" && index > 0) {
                otpBoxes[index - 1].focus();
            }

            if (event.key === "ArrowRight" && index < otpBoxes.length - 1) {
                otpBoxes[index + 1].focus();
            }
        });

        // Paste the complete six-digit code
        box.addEventListener("paste", function (event) {
            event.preventDefault();

            const pastedCode = event.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, 6);

            pastedCode.split("").forEach((digit, i) => {
                otpBoxes[i].value = digit;
            });

            updateVerificationCode();

            const nextEmpty = Array.from(otpBoxes).find(box => !box.value);

            if (nextEmpty) {
                nextEmpty.focus();
            } else {
                otpBoxes[5].focus();
            }
        });
    });

    // VERIFY EMAIL
    verificationForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const code = verificationCode.value.trim();

        if (!email) {
            message.textContent = "Please sign up again.";
            return;
        }

        if (code.length !== 6) {
            message.textContent = "Please enter all six digits.";
            return;
        }

        try {
            message.textContent = "Verifying your email...";

            const response = await fetch("http://localhost:3000/api/auth/verify-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    code: code
                })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.message || "Incorrect verification code. Please try again.";
                return;
            }

            message.textContent = data.message;

            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);

        } catch (error) {
            message.textContent = "Unable to connect to the server.";
            console.error("Verification Error:", error);
        }
    });

    // RESEND VERIFICATION EMAIL
    const resendButton = document.getElementById("resendEmail");

    resendButton.addEventListener("click", async function () {

        if (!email) {
            message.textContent = "Please sign up again.";
            return;
        }

        try {
            message.textContent = "Sending a new verification code...";
            resendButton.disabled = true;

            const response = await fetch("http://localhost:3000/api/auth/resend-verification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();

            message.textContent = data.message;

        } catch (error) {
            message.textContent = "Unable to connect to the server.";
            console.error("Resend Email Error:", error);

        } finally {
            resendButton.disabled = false;
        }
    });

} // CLOSE EMAIL VERIFICATION PAGE

/* DASHBOARD */

const dashboardUser = document.getElementById("dashboardUser");

if (dashboardUser) {
    const savedUser = JSON.parse(
        localStorage.getItem("nikeUser") || "null"
    );

    if (localStorage.getItem("nikeLoggedIn") !== "true" || !savedUser) {
        window.location.href = "login.html";
    } else {
        dashboardUser.textContent = "HI, " + savedUser.name.toUpperCase();
    }
}

/* SHOPPING CART FUNCTIONALITY */

if (document.body.classList.contains("dashboard-page")) {
    const savedUser = JSON.parse(localStorage.getItem("nikeUser") || "null");

    if (localStorage.getItem("nikeLoggedIn") === "true" && savedUser && savedUser.email) {

        const cartStorageKey = "nikeCart_" + savedUser.email.toLowerCase();

        let cart = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");

        const cartCount = document.getElementById("cartCount");

        function updateCartCount() {
            const totalItems = cart.reduce((total, item) => {
                return total + item.quantity;
            }, 0);

            if (cartCount) {
                cartCount.textContent = totalItems;
            }
        }

        document.querySelectorAll(".add-to-cart-btn").forEach(button => {
            button.addEventListener("click", function () {

                const product = {
                    id: this.dataset.id,
                    name: this.dataset.name,
                    price: Number(this.dataset.price),
                    image: this.dataset.image,
                    quantity: 1
                };

                const existingProduct = cart.find(item => item.id === product.id);

                if (existingProduct) {
                    existingProduct.quantity += 1;
                } else {
                    cart.push(product);
                }

                localStorage.setItem(cartStorageKey, JSON.stringify(cart));

                updateCartCount();

                this.textContent = "ADDED TO CART";
            });
        });

        updateCartCount();
    }
}

/* CART PAGE */

if (document.body.classList.contains("cart-page")) {

    const savedUser = JSON.parse(localStorage.getItem("nikeUser") || "null");

    if (localStorage.getItem("nikeLoggedIn") !== "true" || !savedUser || !savedUser.email) {
        window.location.href = "login.html";
    } else {

        const cartStorageKey = "nikeCart_" + savedUser.email.toLowerCase();

        let cart = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");

        const cartItems = document.getElementById("cartItems");
        const emptyCart = document.getElementById("emptyCart");
        const cartSummary = document.getElementById("cartSummary");
        const cartTotal = document.getElementById("cartTotal");

        function renderCart() {

            cartItems.innerHTML = "";

            if (cart.length === 0) {
                emptyCart.style.display = "block";
                cartSummary.style.display = "none";
                return;
            }

            emptyCart.style.display = "none";
            cartSummary.style.display = "block";

            let total = 0;

            cart.forEach((item, index) => {

                total += item.price * item.quantity;

                const cartItem = document.createElement("div");
                cartItem.className = "cart-item";

                const image = document.createElement("img");
                image.src = item.image;
                image.alt = item.name;

                const details = document.createElement("div");
                details.className = "cart-item-details";

                const name = document.createElement("h3");
                name.textContent = item.name;

                const price = document.createElement("p");
                price.textContent = "₱" + item.price.toLocaleString("en-PH");

                const quantity = document.createElement("div");
                quantity.className = "cart-quantity";

                const decrease = document.createElement("button");
                decrease.textContent = "−";
                decrease.dataset.action = "decrease";
                decrease.dataset.index = index;

                const quantityText = document.createElement("span");
                quantityText.textContent = item.quantity;

                const increase = document.createElement("button");
                increase.textContent = "+";
                increase.dataset.action = "increase";
                increase.dataset.index = index;

                const remove = document.createElement("button");
                remove.textContent = "REMOVE";
                remove.className = "remove-cart-item";
                remove.dataset.action = "remove";
                remove.dataset.index = index;

                quantity.append(decrease, quantityText, increase);

                details.append(name, price, quantity, remove);
                cartItem.append(image, details);

                cartItems.appendChild(cartItem);
            });

            cartTotal.textContent = "₱" + total.toLocaleString("en-PH");
        }

        cartItems.addEventListener("click", function (event) {

            const button = event.target.closest("button[data-action]");

            if (!button) return;

            const index = Number(button.dataset.index);
            const action = button.dataset.action;

            if (action === "increase") {
                cart[index].quantity++;
            }

            if (action === "decrease") {
                cart[index].quantity--;

                if (cart[index].quantity <= 0) {
                    cart.splice(index, 1);
                }
            }

            if (action === "remove") {
                cart.splice(index, 1);
            }

            localStorage.setItem(cartStorageKey, JSON.stringify(cart));

            renderCart();
        });

        renderCart();
    }
}

/* LOG OUT */

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("nikeLoggedIn");
        window.location.href = "login.html";
    });
}

