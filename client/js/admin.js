const adminPage = document.body.dataset.page;

function getToken() {
  return localStorage.getItem('minishop-admin-token') || '';
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
    card.innerHTML = `
      <h3>${product.name}</h3>
      <p class="stock">Stock: ${product.stock_quantity}</p>
      <button class="button" type="button">Soft Delete</button>
    `;

    card.querySelector('button').addEventListener('click', async () => {
      const result = await window.minishopApi.deleteProduct(product.id, getToken());
      document.getElementById('admin-message').textContent = result.success ? 'Product updated.' : result.error;
      if (result.success) {
        renderAdminProducts();
      }
    });

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

if (adminPage === 'admin-dashboard') {
  renderAdminProducts();
}
