// Orders page script for fetching and displaying user transactions

document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndLoadOrders();
});

async function checkAuthAndLoadOrders() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Update navbar to show logged in user
    updateAuthUI();
    loadOrders();
}

async function loadOrders() {
    const token = getToken();
    const ordersContainer = document.getElementById('orders-container');

    try {
        const response = await fetch(`${API_BASE}/orders/mine`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load orders');
        }

        const orders = await response.json();
        displayOrders(orders);

    } catch (error) {
        console.error('Load orders error:', error);
        ordersContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to load your orders. Please try again later.</p>
            </div>
        `;
    }
}

function displayOrders(orders) {
    const ordersContainer = document.getElementById('orders-container');

    if (!orders || orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="no-orders">
                <h3>No Orders Yet</h3>
                <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
                <a href="shop.html" class="btn btn-primary">Start Shopping</a>
            </div>
        `;
        return;
    }

    const ordersHTML = orders.map(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        const orderStatus = getOrderStatus(order);
        const statusClass = getStatusClass(order);

        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-info">
                        <h3>Order #${order._id.slice(-8)}</h3>
                        <p class="order-date">${orderDate}</p>
                    </div>
                    <div class="order-status">
                        <span class="status-badge ${statusClass}">${orderStatus}</span>
                    </div>
                </div>
                
                <div class="order-details">
                    <div class="order-items">
                        ${order.orderItems.map(item => `
                            <div class="order-item">
                                <img src="${item.image}" alt="${item.name}" class="item-image">
                                <div class="item-details">
                                    <h4>${item.name}</h4>
                                    <p>Quantity: ${item.quantity}</p>
                                    <p class="item-price">$${item.price.toFixed(2)}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="order-summary">
                        <div class="summary-row">
                            <span>Payment Method:</span>
                            <span>${order.paymentMethod}</span>
                        </div>
                        <div class="summary-row">
                            <span>Total Amount:</span>
                            <span class="total-amount">$${order.totalPrice.toFixed(2)}</span>
                        </div>
                        ${order.paymentDetails && order.paymentDetails.referenceNumber ? `
                            <div class="summary-row">
                                <span>Reference #:</span>
                                <span>${order.paymentDetails.referenceNumber}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="order-shipping">
                    <h4>Shipping Address</h4>
                    <p>${order.shippingAddress.fullName}</p>
                    <p>${order.shippingAddress.address}</p>
                    <p>${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
                    <p>${order.shippingAddress.country}</p>
                    <p>${order.shippingAddress.phone}</p>
                </div>
            </div>
        `;
    }).join('');

    ordersContainer.innerHTML = `
        <div class="orders-list">
            ${ordersHTML}
        </div>
    `;
}

function getOrderStatus(order) {
    if (order.isPaid) {
        return 'Paid';
    }
    
    if (order.paymentMethod === 'GCash' && order.paymentDetails && order.paymentDetails.referenceNumber) {
        return 'Verifying';
    }
    
    if (order.paymentMethod === 'COD') {
        return 'Pending Delivery';
    }
    
    return 'Pending';
}

function getStatusClass(order) {
    if (order.isPaid) {
        return 'status-paid';
    }
    
    if (order.paymentMethod === 'GCash' && order.paymentDetails && order.paymentDetails.referenceNumber) {
        return 'status-verifying';
    }
    
    if (order.paymentMethod === 'COD') {
        return 'status-pending';
    }
    
    return 'status-pending';
}
