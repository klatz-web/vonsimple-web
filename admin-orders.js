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

function getOrderStatus(order) {
    if (order.isPaid) {
        return 'Paid';
    }
    
    if (order.paymentVerificationStatus === 'Rejected') {
        return 'Rejected';
    }
    
    if (order.paymentMethod === 'GCash' && order.paymentDetails && order.paymentDetails.referenceNumber) {
        return order.paymentVerificationStatus === 'Verified' ? 'Verified' : 'Verifying';
    }
    
    if (order.paymentMethod === 'COD') {
        return 'Pending Delivery';
    }
    
    return 'Pending';
}

function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'status-paid';
        case 'verified':
            return 'status-verified';
        case 'verifying':
            return 'status-verifying';
        case 'rejected':
            return 'status-rejected';
        case 'pending':
        case 'pending delivery':
            return 'status-pending';
        default:
            return 'status-pending';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getCustomerName(order) {
    if (order.user && order.user.name) {
        return order.user.name;
    }
    if (order.shippingAddress && order.shippingAddress.fullName) {
        return order.shippingAddress.fullName;
    }
    return 'Unknown';
}

function getCustomerEmail(order) {
    if (order.user && order.user.email) {
        return order.user.email;
    }
    return 'N/A';
}

async function checkAdminStatus() {
    const token = getToken();
    if (!token) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/check-admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.isAdmin;
    } catch (error) {
        return false;
    }
}

async function loadAllOrders() {
    const token = getToken();
    if (!token) {
        document.getElementById('orders-table').innerHTML = `
            <div class="error-message">
                <p>Please login to view admin orders.</p>
                <a href="login.html" class="btn btn-primary">Login</a>
            </div>
        `;
        return;
    }

    // Check if user is admin
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) {
        document.getElementById('orders-table').innerHTML = `
            <div class="error-message">
                <p><strong>Access Denied</strong></p>
                <p>You don't have permission to view admin orders.</p>
                <a href="index.html" class="btn btn-primary">Return to Home</a>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/orders/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Unable to load orders');
        }

        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        document.getElementById('orders-table').innerHTML = `
            <div class="error-message">
                <p>Error loading orders: ${error.message}</p>
            </div>
        `;
    }
}

function displayOrders(orders) {
    const ordersTable = document.getElementById('orders-table');
    
    if (!orders || orders.length === 0) {
        ordersTable.innerHTML = '<p class="empty-state">No orders found.</p>';
        return;
    }

    ordersTable.innerHTML = `
        <table class="admin-orders-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => {
                    const status = getOrderStatus(order);
                    const statusClass = getStatusClass(status);
                    return `
                        <tr class="order-row" data-status="${status.toLowerCase()}">
                            <td><small>${order._id}</small></td>
                            <td><strong>${getCustomerName(order)}</strong></td>
                            <td><small>${getCustomerEmail(order)}</small></td>
                            <td><small>${formatDate(order.createdAt)}</small></td>
                            <td>${order.orderItems.length} items</td>
                            <td>₱${order.totalPrice.toFixed(2)}</td>
                            <td>${order.paymentMethod}</td>
                            <td><span class="status-badge ${statusClass}">${status}</span></td>
                            <td>
                                <button class="btn btn-secondary btn-sm" onclick="viewOrderDetails('${order._id}')">View</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    // Setup filter functionality
    setupFilters();
}

function setupFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');

    if (statusFilter) {
        statusFilter.addEventListener('change', filterOrders);
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterOrders);
    }
}

function filterOrders() {
    const statusFilter = document.getElementById('statusFilter').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('.order-row');

    rows.forEach(row => {
        const rowStatus = row.dataset.status;
        const customerName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const customerEmail = row.querySelector('td:nth-child(3)').textContent.toLowerCase();

        const statusMatch = statusFilter === 'all' || rowStatus === statusFilter;
        const searchMatch = customerName.includes(searchInput) || customerEmail.includes(searchInput);

        row.style.display = statusMatch && searchMatch ? '' : 'none';
    });
}

function viewOrderDetails(orderId) {
    // For now, just alert the order ID
    // In the future, this could open a modal with full order details
    alert(`Viewing order: ${orderId}\n\nFull order details modal coming soon!`);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAllOrders();
    
    // Set current year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});
