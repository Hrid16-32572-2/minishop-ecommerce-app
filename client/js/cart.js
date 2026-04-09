function readCart() {
  return JSON.parse(localStorage.getItem('minishop-cart') || '[]');
}

function writeMessage(message) {
  const messageNode = document.getElementById('cart-message');
  if (messageNode) {
    messageNode.textContent = message;
  }
}

function renderCart() {
  const root = document.getElementById('cart-items');
  const cart = readCart();

  root.innerHTML = '';

  if (cart.length === 0) {
    root.textContent = 'Your cart is empty.';
    return;
  }

  for (const item of cart) {
    const row = document.createElement('div');
    row.className = 'card';
    row.innerHTML = `<strong>${item.name || `Product ${item.product_id}`}</strong><span>Qty: ${item.quantity}</span>`;
    root.appendChild(row);
  }
}

document.getElementById('checkout-button')?.addEventListener('click', async () => {
  const cart = readCart();
  const response = await window.minishopApi.checkout(cart);

  if (response.success) {
    localStorage.removeItem('minishop-cart');
    renderCart();
    writeMessage('Checkout complete.');
    return;
  }

  writeMessage(response.error || 'Checkout failed.');
});

renderCart();
