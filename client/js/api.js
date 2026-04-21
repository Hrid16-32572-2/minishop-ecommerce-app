window.minishopApi = (() => {
  const API_BASE = 'http://localhost:3000/api/v1';

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    return response.json();
  }

  return {
    getProducts() {
      return request('/products', {
        cache: 'no-store'
      });
    },
    getProduct(id) {
      return request(`/products/${id}`);
    },
    checkout(items) {
      return request('/orders', {
        method: 'POST',
        body: JSON.stringify({ items })
      });
    },
    login(payload) {
      return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    deleteProduct(id, token) {
      return request(`/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    addProduct(payload, token) {
      return request('/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
    },
    updateProductStock(id, stockQuantity, token) {
      return request(`/products/${id}/stock`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ stock_quantity: stockQuantity })
      });
    }
  };
})();
