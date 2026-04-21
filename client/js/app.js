const page = document.body.dataset.page;

function getProductId(product) {
  if (!product || typeof product !== 'object') {
    return null;
  }

  const raw = product.id ?? product.product_id;
  if (raw === null || raw === undefined) {
    return null;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function getProductIdFromQuery() {
  const rawProductId = new URLSearchParams(window.location.search).get('id')
    || sessionStorage.getItem('selectedProductId');
  const productId = Number.parseInt(rawProductId ?? '', 10);
  if (Number.isInteger(productId) && productId > 0) {
    sessionStorage.setItem('selectedProductId', String(productId));
    return productId;
  }
  return null;
}

function addToCart(product) {
  const productId = getProductId(product);
  if (productId === null) {
    return;
  }

  const current = JSON.parse(localStorage.getItem('minishop-cart') || '[]');
  const existing = current.find((item) => item.product_id === productId);
  const productImageUrl = typeof product.image_url === 'string' ? product.image_url : '';

  if (existing) {
    existing.quantity += 1;
    if (!existing.image_url && productImageUrl) {
      existing.image_url = productImageUrl;
    }
  } else {
    current.push({
      product_id: productId,
      quantity: 1,
      name: product.name,
      image_url: productImageUrl
    });
  }

  localStorage.setItem('minishop-cart', JSON.stringify(current));
  updateCartCount();
  showStoreMessage(`${product.name} added to cart.`);
}

function getCartCount() {
  const current = JSON.parse(localStorage.getItem('minishop-cart') || '[]');
  return current.reduce((total, item) => total + (Number.parseInt(item.quantity, 10) || 0), 0);
}

function updateCartCount() {
  const cartCountNode = document.getElementById('cart-count');
  if (!cartCountNode) {
    return;
  }

  cartCountNode.textContent = String(getCartCount());
}

function showStoreMessage(message) {
  const node = document.getElementById('store-message');
  if (!node) {
    return;
  }

  node.textContent = message;
  setTimeout(() => {
    if (node.textContent === message) {
      node.textContent = '';
    }
  }, 1500);
}

async function renderCatalog() {
  const root = document.getElementById('product-list');
  if (!root) {
    return;
  }

  const response = await window.minishopApi.getProducts();
  root.innerHTML = '';

  for (const product of response.data || []) {
    const id = product.id || product.product_id;
    const productId = Number.parseInt(id, 10);
    if (!Number.isInteger(productId) || productId <= 0) {
      continue;
    }

    const imageMarkup = product.image_url
      ? `<img class="product-image" src="${product.image_url}" alt="${product.name}">`
      : `<div class="product-image product-image-placeholder">No Image Available</div>`;

    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      ${imageMarkup}
      <h3>${product.name}</h3>
      <p>${product.description || ''}</p>
      <p class="price">$${product.price}</p>
      <p class="stock">Stock: ${product.stock_quantity}</p>
      <div class="actions">
        <a class="button button-secondary details-link" href="./product.html?id=${productId}" data-product-id="${productId}">Details</a>
        <button class="button add-to-cart-button" type="button" data-product-id="${productId}">Add to cart</button>
      </div>
    `;

    const detailsLink = card.querySelector('.details-link');
    if (detailsLink) {
      detailsLink.addEventListener('click', (event) => {
        const id = Number.parseInt(event.currentTarget.dataset.productId, 10);
        if (!Number.isInteger(id)) {
          event.preventDefault();
          return;
        }
        sessionStorage.setItem('selectedProductId', String(id));
        event.currentTarget.href = `./product.html?id=${id}`;
      });
    }

    const addButton = card.querySelector('.add-to-cart-button');
    if (addButton) {
      addButton.addEventListener('click', () => addToCart(product));
    }
    root.appendChild(card);
  }
}

async function renderProduct() {
  const root = document.getElementById('product-detail');
  if (!root) {
    return;
  }

  const productId = getProductIdFromQuery();
  if (productId === null) {
    root.innerHTML = '<h1>Product Not Found</h1><p>This product could not be loaded.</p>';
    return;
  }

  const response = await window.minishopApi.getProduct(productId);

  if (!response.success || !response.data) {
    root.innerHTML = '<h1>Product Not Found</h1><p>This product could not be loaded.</p>';
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

document.addEventListener('DOMContentLoaded', () => {
  if (page === 'home') {
    const viewCartButton = document.getElementById('view-cart-button');
    if (viewCartButton) {
      viewCartButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = './cart.html';
      });
    }
    updateCartCount();
    renderCatalog();
  }

  if (page === 'product') {
    renderProduct();
  }
});
