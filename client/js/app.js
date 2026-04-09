const page = document.body.dataset.page;

function addToCart(product) {
  const current = JSON.parse(localStorage.getItem('minishop-cart') || '[]');
  const existing = current.find((item) => item.product_id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    current.push({ product_id: product.id, quantity: 1, name: product.name });
  }

  localStorage.setItem('minishop-cart', JSON.stringify(current));
}

async function renderCatalog() {
  const root = document.getElementById('product-list');
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
      <p>${product.description || ''}</p>
      <p class="price">$${product.price}</p>
      <p class="stock">Stock: ${product.stock_quantity}</p>
      <div class="actions">
        <a class="button button-secondary" href="./product.html?id=${product.id}">Details</a>
        <button class="button" type="button">Add to cart</button>
      </div>
    `;

    card.querySelector('button').addEventListener('click', () => addToCart(product));
    root.appendChild(card);
  }
}

async function renderProduct() {
  const root = document.getElementById('product-detail');
  if (!root) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const response = await window.minishopApi.getProduct(id);

  if (!response.success) {
    root.textContent = response.error;
    return;
  }

  const product = response.data;
  root.innerHTML = `
    <p class="eyebrow">Product #${product.id}</p>
    <h1>${product.name}</h1>
    <p>${product.description || ''}</p>
    <p class="price">$${product.price}</p>
    <p class="stock">Stock: ${product.stock_quantity}</p>
    <button class="button" type="button">Add to cart</button>
  `;

  root.querySelector('button').addEventListener('click', () => addToCart(product));
}

if (page === 'home') {
  renderCatalog();
}

if (page === 'product') {
  renderProduct();
}
