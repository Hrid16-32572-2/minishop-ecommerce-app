const adminPage = document.body.dataset.page;

function getToken() {
  return localStorage.getItem('minishop-admin-token') || '';
}

function writeAdminMessage(message) {
  const node = document.getElementById('admin-message');
  if (node) {
    node.textContent = message;
  }
}

async function renderAdminProducts() {
  const root = document.getElementById('admin-products');
  if (!root) {
    return;
  }

  const response = await window.minishopApi.getProducts();
  root.innerHTML = '';

  for (const product of response.data || []) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.productId = String(product.id);
    card.innerHTML = `
      <h3>${product.name}</h3>
      <p class="price">$${product.price}</p>
      <p class="stock">Stock: ${product.stock_quantity}</p>
      <label>
        Update Stock
        <input class="stock-input" type="number" min="0" step="1" value="${product.stock_quantity}">
      </label>
      <div class="actions">
        <button class="button save-stock-button" type="button">Save</button>
        <button class="button button-secondary soft-delete-button" type="button">Soft Delete</button>
      </div>
    `;

    root.appendChild(card);
  }
}

document.getElementById('admin-login-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const payload = {
    email: formData.get('email'),
    password: formData.get('password')
  };

  const response = await window.minishopApi.login(payload);
  const messageNode = document.getElementById('admin-login-message');

  if (!response.success) {
    messageNode.textContent = response.error || 'Login failed.';
    return;
  }

  localStorage.setItem('minishop-admin-token', response.data.token);
  window.location.href = './admin-dashboard.html';
});

document.getElementById('admin-products')?.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) {
    return;
  }

  const card = button.closest('[data-product-id]');
  if (!card) {
    return;
  }

  const productId = Number.parseInt(card.dataset.productId, 10);
  if (!Number.isInteger(productId)) {
    writeAdminMessage('INVALID_INPUT');
    return;
  }

  if (button.classList.contains('soft-delete-button')) {
    const result = await window.minishopApi.deleteProduct(productId, getToken());
    writeAdminMessage(result.success ? 'Product deleted.' : result.error);
    if (result.success) {
      renderAdminProducts();
    }
    return;
  }

  if (button.classList.contains('save-stock-button')) {
    const stockInput = card.querySelector('.stock-input');
    const stockQuantity = Number.parseInt(stockInput?.value, 10);
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      writeAdminMessage('INVALID_INPUT');
      return;
    }

    const result = await window.minishopApi.updateProductStock(productId, stockQuantity, getToken());
    writeAdminMessage(result.success ? 'Stock updated.' : result.error);
    if (result.success) {
      renderAdminProducts();
    }
  }
});

document.getElementById('add-product-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const priceRaw = String(formData.get('price') ?? '').trim();
  const stockRaw = String(formData.get('stock_quantity') ?? '').trim();
  const price = Number.parseFloat(priceRaw);
  const stockQuantity = Number.parseInt(stockRaw, 10);

  if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
    writeAdminMessage('INVALID_INPUT');
    return;
  }

  const payload = {
    name: String(formData.get('name') || '').trim(),
    description: String(formData.get('description') || '').trim(),
    price,
    stock_quantity: stockQuantity,
    image_url: String(formData.get('image_url') || '').trim()
  };

  const result = await window.minishopApi.addProduct(payload, getToken());
  const createdId = Number.parseInt(result?.data?.id, 10);
  const isActive = result?.data?.is_active === true;
  const isValidCreateResponse = result.success && Number.isInteger(createdId) && createdId > 0 && isActive;

  writeAdminMessage(isValidCreateResponse ? 'Product added.' : (result.error || 'INVALID_INPUT'));
  if (result.success) {
    if (!isValidCreateResponse) {
      return;
    }
    form.reset();
    window.location.reload();
  }
});

if (adminPage === 'admin-dashboard') {
  renderAdminProducts();
}
