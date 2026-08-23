// Function to change quantity using +/- buttons
function changeQuantity(button, change) {
    const controls = button.parentElement;
    const input = controls.querySelector('.quantity-input');
    let currentValue = parseInt(input.value) || 0;
    let newValue = currentValue + change;

    if (newValue < 0) {
        newValue = 0;
    }

    input.value = newValue;
    recalculateCart();
}

// Function to validate and sanitize text inputs
function validateQuantity(input) {
    let value = parseInt(input.value);
    if (isNaN(value) || value < 0) {
        value = 0;
    }
    input.value = value;
    recalculateCart();
}

// Function to calculate all cart totals and update UI
function recalculateCart() {
    let subtotal = 0;
    let totalWeightGrams = 0;
    let totalItems = 0;
    let selectedItemsList = [];

    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        const name = item.getAttribute('data-name');
        const price = parseInt(item.getAttribute('data-price')) || 0;
        const weight = parseInt(item.getAttribute('data-weight')) || 0;
        const qtyInput = item.querySelector('.quantity-input');
        const qty = parseInt(qtyInput.value) || 0;

        if (qty > 0) {
            subtotal += price * qty;
            totalWeightGrams += weight * qty;
            totalItems += qty;
            selectedItemsList.push(`${name} (${qty})`);
        }
    });

    // Calculate GST (5% as updated by the user)
    const gstRate = 0.05;
    const gst = Math.round(subtotal * gstRate);

    // Delivery fee (Free above ₹2000, otherwise ₹99 if cart is not empty)
    let delivery = 0;
    if (subtotal > 0) {
        delivery = subtotal > 200 ? 0 : 50;
    }

    // Grand total
    const total = subtotal + gst + delivery;

    // Format weight
    const totalWeightKg = (totalWeightGrams / 1000).toFixed(2);

    // Update the UI elements
    document.getElementById('cart-subtotal').innerText = `₹${subtotal.toLocaleString('en-IN')}`;
    document.getElementById('cart-gst').innerText = `₹${gst.toLocaleString('en-IN')}`;
    document.getElementById('cart-delivery').innerText = delivery === 0 && subtotal > 0 ? 'FREE' : `₹${delivery}`;
    document.getElementById('cart-total-weight').innerText = `${totalWeightKg} kg`;
    document.getElementById('cart-total').innerText = `₹${total.toLocaleString('en-IN')}`;

    // Update top row selections
    const countBadge = document.getElementById('cart-item-count');
    const summaryText = document.getElementById('cart-summary-items');

    countBadge.innerText = `${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}`;

    if (selectedItemsList.length > 0) {
        summaryText.innerText = selectedItemsList.join(', ');
    } else {
        summaryText.innerText = "No items selected";
    }
}

// Checkout button handler
function checkout() {
    let subtotal = 0;
    let totalWeightGrams = 0;
    let summary = "--- Order Summary ---\n\n";
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        const name = item.getAttribute('data-name');
        const price = parseInt(item.getAttribute('data-price')) || 0;
        const weight = parseInt(item.getAttribute('data-weight')) || 0;
        const qty = parseInt(item.querySelector('.quantity-input').value) || 0;

        if (qty > 0) {
            summary += `${name} x ${qty} = ₹${(price * qty).toLocaleString('en-IN')} (${(weight * qty / 1000).toFixed(2)} kg)\n`;
            subtotal += price * qty;
            totalWeightGrams += weight * qty;
        }
    });

    if (subtotal === 0) {
        alert("Your cart is empty. Please add items to checkout!");
        return;
    }

    const gst = Math.round(subtotal * 0.05);
    const delivery = subtotal > 2000 ? 0 : 99;
    const total = subtotal + gst + delivery;
    const totalWeightKg = (totalWeightGrams / 1000).toFixed(2);

    summary += `\nSubtotal: ₹${subtotal.toLocaleString('en-IN')}`;
    summary += `\nGST (5%): ₹${gst.toLocaleString('en-IN')}`;
    summary += `\nDelivery: ${delivery === 0 ? 'FREE' : `₹${delivery}`}`;
    summary += `\nTotal Weight: ${totalWeightKg} kg`;
    summary += `\n----------------------`;
    summary += `\nGrand Total: ₹${total.toLocaleString('en-IN')}`;
    summary += `\n\nThank you for shopping at Somaiya Store!`;

    alert(summary);
}

// Run initial calculation to set defaults
document.addEventListener('DOMContentLoaded', () => {
    recalculateCart();
});
