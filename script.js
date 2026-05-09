const bar = document.getElementById('bar');
const nav = document.getElementById('navbar');
const closeBtn = document.getElementById('close');
const authLink = document.getElementById('auth-link');
const yearElement = document.getElementById('year');

const API_BASE = (() => {
    if (window.BACKEND_URL) {
        return `${window.BACKEND_URL.replace(/\/$/, '')}/api`;
    }
    if (window.location.protocol === 'file:') {
        return 'http://localhost:5000/api';
    }
    return '/api';
})();

function getToken() {
    return localStorage.getItem('token');
}

function getUserIdFromToken(token) {
    try {
        // Parse JWT token to get user ID
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function showMessage(message, type = 'success') {
    const existing = document.querySelector('.message-banner');
    if (existing) existing.remove();
    const banner = document.createElement('div');
    banner.className = `message-banner ${type}`;
    banner.textContent = message;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 3500);
}

function updateAuthLink() {
    if (!authLink) return;
    const token = getToken();
    if (token) {
        authLink.textContent = 'Logout';
        authLink.href = '#';
        authLink.addEventListener('click', (event) => {
            event.preventDefault();
            removeToken();
            showMessage('Logged out successfully.', 'success');
            authLink.textContent = 'Login';
            authLink.href = 'login.html';
            window.location.reload();
        }, { once: true });
    } else {
        authLink.textContent = 'Login';
        authLink.href = 'login.html';
    }
}

function initNav() {
    if (!bar || !nav || !closeBtn) return;
    bar.addEventListener('click', () => nav.classList.toggle('active'));
    closeBtn.addEventListener('click', () => nav.classList.remove('active'));
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) nav.classList.remove('active');
    });
}

function setCurrentYear() {
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (!response.ok) throw new Error('Unable to load products');
        return await response.json();
    } catch (error) {
        const message = error.message.includes('Failed to fetch') || error.message.includes('NetworkError')
            ? 'Backend unavailable. Start the backend with \`npm start\` in the server folder or deploy the backend.'
            : error.message;
        showMessage(message, 'error');
        return [];
    }
}

async function renderShop() {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;
    const products = await fetchProducts();
    if (!products.length) {
        productGrid.innerHTML = '<p class="empty-state">No products available yet. Please come back later.</p>';
        return;
    }
    
    // Products with missing images
    const missingImages = ['n6.png', 'n7.png', 'n8.png'];
    
    productGrid.innerHTML = products.map((product) => {
        const isComingSoon = missingImages.some(img => product.image.includes(img));
        return `
        <div class="product-card ${isComingSoon ? 'coming-soon' : ''}">
            <img src="${product.image}" alt="${product.title}" onerror="this.style.display='none'; this.parentElement.classList.add('no-image');">
            ${isComingSoon ? '<div class="coming-soon-badge">COMING SOON</div>' : ''}
            <div class="des">
                <span>${product.category}</span>
                <h5>${product.title}</h5>
                <div class="star">
                    ${'<i class="fa-solid fa-star"></i>'.repeat(5)}
                </div>
                <h4>₱${product.price.toFixed(2)}</h4>
            </div>
            <div class="actions">
                <button class="btn btn-secondary" onclick="addToCart('${product._id}')">Add to Cart</button>
            </div>
        </div>
    `}).join('');
}

async function addToCart(productId) {
    const token = getToken();
    if (!token) {
        showMessage('Please login before adding items to your cart.', 'error');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId, quantity: 1 }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to add item to cart');
        showMessage(result.message, 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function displayCart() {
    const token = getToken();
    const cartContainer = document.getElementById('cart-container');
    const cartSummary = document.getElementById('cart-summary');
    if (!cartContainer) return;

    if (!token) {
        cartContainer.innerHTML = `
            <div class="form-card">
                <h2>Finish your purchase</h2>
                <p>You must be logged in to view and manage your cart.</p>
                <a class="btn btn-primary" href="login.html">Login</a>
            </div>
        `;
        if (cartSummary) cartSummary.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Unable to load cart');
        const data = await response.json();
        const items = data.items || [];

        if (!items.length) {
            cartContainer.innerHTML = '<p class="empty-state">Your cart is empty. Add product from shop.</p>';
            if (cartSummary) cartSummary.innerHTML = '';
            return;
        }

        cartContainer.innerHTML = `
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>
                                <strong>${item.title}</strong><br>
                                <span>${item.category}</span>
                            </td>
                            <td>₱${item.price.toFixed(2)}</td>
                            <td><input type="number" min="1" value="${item.quantity}" onchange="updateCartItem('${item.productId}', this.value)"></td>
                            <td>₱${(item.price * item.quantity).toFixed(2)}</td>
                            <td><button class="btn btn-secondary" onclick="removeCartItem('${item.productId}')">Remove</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        if (cartSummary) {
            cartSummary.innerHTML = `
                <div class="card">
                    <h3>Order Summary</h3>
                    <p><strong>Subtotal:</strong> ₱${data.total.toFixed(2)}</p>
                    <p><strong>Items:</strong> ${items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                    <button class="btn btn-primary" onclick="checkoutCart()">Proceed to Checkout</button>
                </div>
            `;
        }
    } catch (error) {
        cartContainer.innerHTML = `<p class="empty-state error">${error.message}</p>`;
        if (cartSummary) cartSummary.innerHTML = '';
    }
}

async function updateCartItem(productId, quantity) {
    const token = getToken();
    if (!token) return;
    const qty = parseInt(quantity, 10);
    if (qty < 1) return;

    try {
        const response = await fetch(`${API_BASE}/cart/update/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity: qty }),
        });
        if (!response.ok) throw new Error('Unable to update cart item');
        await displayCart();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function removeCartItem(productId) {
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/cart/remove/${productId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Unable to remove item');
        await displayCart();
        showMessage('Item removed from cart.', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function checkoutCart() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Get current cart data
        const cartResponse = await fetch(`${API_BASE}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!cartResponse.ok) {
            throw new Error('Failed to load cart');
        }

        const cartData = await cartResponse.json();
        
        if (!cartData.items || cartData.items.length === 0) {
            showMessage('Your cart is empty', 'error');
            return;
        }

        // Show checkout modal with payment options
        showCheckoutModal(cartData);

    } catch (error) {
        console.error('Checkout error:', error);
        showMessage('Failed to load cart. Please try again.', 'error');
    }
}

function showCheckoutModal(cartData) {
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Checkout</h3>
            <div class="checkout-form">
                <h4>Shipping Information</h4>
                <form id="checkout-form">
                    <input type="text" id="fullName" placeholder="Full Name" required>
                    <input type="text" id="address" placeholder="Address" required>
                    <input type="text" id="city" placeholder="City" required>
                    <input type="text" id="postalCode" placeholder="Postal Code" required>
                    <input type="text" id="country" placeholder="Country" required>
                    <input type="tel" id="phone" placeholder="Phone Number" required>
                    
                    <h4>Payment Method</h4>
                    <div class="payment-methods">
                        <label>
                            <input type="radio" name="paymentMethod" value="COD" checked>
                            Cash on Delivery (COD)
                        </label>
                        <label>
                            <input type="radio" name="paymentMethod" value="GCash">
                            GCash (Manual QR)
                        </label>
                    </div>
                    
                    <div id="instapay-details" style="display: none;">
                        <div class="instapay-container">
                            <p class="instapay-instructions">
                                Scan QR code below with your InstaPay app and enter reference number:
                            </p>
                            <div class="instapay-qr-container">
                                <img src="img/instapay-qr.png" alt="InstaPay QR Code" class="instapay-qr" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                <div class="instapay-placeholder" style="display: none;">
                                    <p>InstaPay QR Code will be displayed here</p>
                                </div>
                            </div>
                            <input type="text" id="referenceNumber" placeholder="Enter 13-digit GCash Reference Number" pattern="[0-9]{13}" maxlength="13">
                            <small class="reference-hint">Must be exactly 13 digits</small>
                        </div>
                    </div>
                    
                    <div class="order-summary">
                        <p><strong>Total:</strong> ₱${cartData.total.toFixed(2)}</p>
                        <p><strong>Items:</strong> ${cartData.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" id="cancel-btn">Cancel</button>
                        <button type="button" id="place-order-btn" class="btn btn-primary">Place Order</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    document.getElementById('cancel-btn').addEventListener('click', closeCheckoutModal);
    document.getElementById('place-order-btn').addEventListener('click', () => processOrder(cartData));

    // Toggle InstaPay reference number field
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const instapayDetails = document.getElementById('instapay-details');
            instapayDetails.style.display = e.target.value === 'GCash' ? 'block' : 'none';
        });
    });
}

function closeCheckoutModal() {
    const modal = document.querySelector('.checkout-modal');
    if (modal) {
        modal.remove();
    }
}

async function processOrder(cartData) {
    const token = getToken();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Manual form validation
    const fullName = document.getElementById('fullName').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const postalCode = document.getElementById('postalCode').value.trim();
    const country = document.getElementById('country').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!fullName || !address || !city || !postalCode || !country || !phone) {
        showMessage('Please fill in all shipping information fields', 'error');
        return;
    }
    
    // Frontend validation for GCash reference number
    if (paymentMethod === 'GCash') {
        const referenceNumber = document.getElementById('referenceNumber').value.trim();
        if (!referenceNumber) {
            showMessage('Reference number is required for GCash payments', 'error');
            return;
        }
        if (referenceNumber.length !== 13 || !/^\d{13}$/.test(referenceNumber)) {
            showMessage('GCash reference number must be exactly 13 digits', 'error');
            return;
        }
    }
    
    const orderData = {
        orderItems: cartData.items.map(item => ({
            name: item.title,
            quantity: item.quantity,
            image: item.image,
            price: item.price,
            product: item.productId
        })),
        shippingAddress: {
            fullName: fullName,
            address: address,
            city: city,
            postalCode: postalCode,
            country: country,
            phone: phone
        },
        totalPrice: cartData.total,
        paymentMethod: paymentMethod,
        paymentDetails: paymentMethod === 'GCash' ? {
            referenceNumber: document.getElementById('referenceNumber').value
        } : {}
    };

    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok) {
            closeCheckoutModal();
            showMessage('Order placed successfully! Thank you for your purchase.', 'success');
            
            // Clear cart after successful order
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            showMessage(result.message || 'Failed to place order. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Order processing error:', error);
        showMessage('Failed to place order. Please try again.', 'error');
    }
}

async function handleFormSubmit(event, endpoint, successRedirect) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_BASE}/auth/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Request failed');
        if (result.token) setToken(result.token);
        showMessage(result.message, 'success');
        window.location.href = successRedirect;
    } catch (error) {
        const message = error.message.includes('Failed to fetch') || error.message.includes('NetworkError')
            ? 'Backend unavailable. Start the backend with `npm start` in the server folder or deploy the backend.'
            : error.message;
        const errorBox = document.getElementById('error-message');
        if (errorBox) errorBox.textContent = message;
        showMessage(message, 'error');
    }
}

function attachFormListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => handleFormSubmit(event, 'login', 'shop.html'));
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (event) => handleFormSubmit(event, 'signup', 'shop.html'));
    }
}

function initPage() {
    initNav();
    updateAuthLink();
    setCurrentYear();
    attachFormListeners();
    renderShop();
    displayCart();
}

window.addEventListener('DOMContentLoaded', initPage);

