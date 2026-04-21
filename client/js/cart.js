function readCart() {
  return JSON.parse(localStorage.getItem('minishop-cart') || '[]');
}

function writeCart(cart) {
  localStorage.setItem('minishop-cart', JSON.stringify(cart));
  renderCart();
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
    const imageMarkup = item.image_url
      ? `<img class="cart-item-image" src="${item.image_url}" alt="${item.name || `Product ${item.product_id}`}">`
      : '<div class="cart-item-image product-image-placeholder">No Image Available</div>';

    const row = document.createElement('div');
    row.className = 'card';
    row.dataset.productId = String(item.product_id);
    row.innerHTML = `
      <div class="cart-item-row">
        ${imageMarkup}
        <div class="cart-item-content">
          <strong>${item.name || `Product ${item.product_id}`}</strong>
          <div class="actions">
            <button class="button button-secondary qty-down" type="button">-</button>
            <span>Qty: ${item.quantity}</span>
            <button class="button button-secondary qty-up" type="button">+</button>
            <button class="button remove-item" type="button">Remove</button>
          </div>
        </div>
      </div>
    `;
    root.appendChild(row);
  }
}

document.getElementById('cart-items')?.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) {
    return;
  }

  const row = button.closest('[data-product-id]');
  if (!row) {
    return;
  }

  const productId = Number.parseInt(row.dataset.productId, 10);
  if (!Number.isInteger(productId)) {
    return;
  }

  const cart = readCart();
  const index = cart.findIndex((item) => item.product_id === productId);
  if (index < 0) {
    return;
  }

  if (button.classList.contains('remove-item')) {
    cart.splice(index, 1);
    writeCart(cart);
    writeMessage('Item removed.');
    return;
  }

  if (button.classList.contains('qty-up')) {
    cart[index].quantity += 1;
    writeCart(cart);
    writeMessage('Quantity updated.');
    return;
  }

  if (button.classList.contains('qty-down')) {
    cart[index].quantity -= 1;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    writeCart(cart);
    writeMessage('Quantity updated.');
  }
});

document.getElementById('checkout-button')?.addEventListener('click', async () => {
  const cart = readCart();
  if (cart.length === 0) {
    writeMessage('Your cart is empty.');
    return;
  }

  const response = await window.minishopApi.checkout(cart);

  if (response.success) {
    writeCart([]);
    writeMessage('Checkout complete.');
    setTimeout(() => {
      window.location.href = './index.html';
    }, 500);
    return;
  }

  writeMessage(response.error || 'Checkout failed.');
});

renderCart();
