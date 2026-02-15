// Main JavaScript file for Canteen Ordering System

document.addEventListener('DOMContentLoaded', () => {
    // Add Fade-in effect to main container
    const container = document.querySelector('.container');
    if (container) {
        container.style.opacity = 0;
        container.style.transition = 'opacity 1s ease-in-out';
        setTimeout(() => {
            container.style.opacity = 1;
        }, 100);
    }

    // Auto-hide alerts
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.display = 'none';
        }, 3000);
    });

    // Initialize Cart Badge on Load
    updateCartBadge();
});

// =========================================
// CART LOGIC (Server-Side Only)
// =========================================

// =========================================
// CART LOGIC
// =========================================

function addToCart(btn) {
    const menuId = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    const image = btn.dataset.image;

    // Button Loading State
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    fetch('/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'add',
            menu_id: menuId,
            item_name: name,
            price: price,
            image: image
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                updateCartBadge();
                showAddToCartModal({ name, price, image });
            } else {
                alert('Failed: ' + data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert('Network error');
        })
        .finally(() => {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        });
}

function showAddToCartModal(item) {
    const modal = document.getElementById('addToCartModal');
    if (!modal) return;

    // Populate Data
    document.getElementById('modalItemName').innerText = item.name;
    document.getElementById('modalItemPrice').innerText = '₹' + item.price;
    document.getElementById('modalItemImage').src = item.image;

    // Show
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeAddToCartModal() {
    const modal = document.getElementById('addToCartModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function updateCartBadge() {
    console.log('Updating cart badge...');
    fetch('cart/data', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            console.log('Cart data:', data);
            if (data.status === 'success') {
                const totalCount = data.cart ? data.cart.totalQty : 0;
                const badges = document.querySelectorAll('.cart-count');

                console.log('Total items in cart:', totalCount);
                badges.forEach(badge => {
                    if (totalCount > 0) {
                        badge.style.display = 'inline-block';
                        badge.textContent = totalCount;
                    } else {
                        badge.style.display = 'none';
                    }
                });
            }
        })
        .catch(err => console.error('Error updating badge:', err));
}

// =========================================
// CART UI (Redirect to Page)
// =========================================

// =========================================
// CART UI (Redirect to Page)
// =========================================

function openCartModal() {
    window.location.href = 'cart';
}

function closeCartModal() {
    // Not used anymore
}

// =========================================
// BOOKING MODAL
// =========================================

function openBookingModal() {
    const today = new Date().toISOString().split('T')[0];
    document.querySelector('input[name="booking_date"]').setAttribute('min', today);
    document.getElementById('bookingModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

window.onclick = function (event) {
    const modal = document.getElementById('bookingModal');
    if (event.target == modal) {
        closeBookingModal();
    }
}

function filterMenu(category, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const items = document.querySelectorAll('.menu-item');
    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
            setTimeout(() => item.style.opacity = '1', 50);
        } else {
            item.style.display = 'none';
            item.style.opacity = '0';
        }
    });
}

// =========================================
// TOAST NOTIFICATION SYSTEM
// =========================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.warn('Toast container not found in DOM');
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    const title = type === 'success' ? 'Success' : 'Error';

    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icon}"></i></div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'slideOutToast 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
        toast.addEventListener('animationend', () => { if (toast.parentElement) toast.remove(); });
    }, 3000);

    // Click to dismiss
    toast.addEventListener('click', () => {
        toast.style.animation = 'slideOutToast 0.3s ease forwards';
        setTimeout(() => { if (toast.parentElement) toast.remove(); }, 300);
    });
}


