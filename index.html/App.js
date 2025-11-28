// ============================================
// CURSOR PERSONALIZADO ANIMADO
// ============================================
const cursor = document.querySelector('.custom-cursor');
const cursorDot = document.querySelector('.custom-cursor-dot');

let mouseX = 0; let mouseY = 0;
let cursorX = 0; let cursorY = 0;
let dotX = 0; let dotY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    dotX = e.clientX - 4; dotY = e.clientY - 4;
    if (cursor) cursor.classList.add('active'); 
});

function animateCursor() {
    const speed = 0.2;
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    if (cursor) { cursor.style.left = cursorX - 12 + 'px'; cursor.style.top = cursorY - 12 + 'px'; }
    if (cursorDot) { cursorDot.style.left = dotX + 'px'; cursorDot.style.top = dotY + 'px'; }
    requestAnimationFrame(animateCursor);
}
if (cursor && cursorDot) animateCursor();

document.addEventListener('mouseover', (e) => {
    if (e.target.matches('a, button, input, select, .product-card, label')) cursor.classList.add('hover');
});
document.addEventListener('mouseout', (e) => {
    if (e.target.matches('a, button, input, select, .product-card, label')) cursor.classList.remove('hover');
});

// ============================================
// BASE DE DATOS
// ============================================
const productsData = [
    { id: 1, title: "Motor 2.0L VVT-i Completo", description: "Baja millaje", price: 550.00, stock: 3, brand: "Toyota", model: "Corolla", year: 2010, type: "motor", condition: "Usado" },
    { id: 2, title: "Transmisión Automática 4x4", description: "Buen estado", price: 900.00, stock: 1, brand: "Ford", model: "F-150", year: 2005, type: "transmision", condition: "Usado" },
    { id: 3, title: "Puerta Trasera Derecha", description: "Sin abolladuras", price: 150.00, stock: 5, brand: "Honda", model: "Civic", year: 2015, type: "carroceria", condition: "Usado" },
    { id: 4, title: "Kit de Frenos", description: "Seminuevos", price: 85.50, stock: 0, brand: "Toyota", model: "Camry", year: 2012, type: "frenos", condition: "Usado" },
    { id: 5, title: "Alternador", description: "150 Amp", price: 120.00, stock: 7, brand: "Universal", model: "NA", year: 2008, type: "electrico", condition: "Reacondicionado" },
    { id: 6, title: "Parachoques Delantero", description: "Negro", price: 220.00, stock: 2, brand: "Honda", model: "CR-V", year: 2018, type: "carroceria", condition: "Usado" }
];

// ============================================
// REFERENCIAS DOM
// ============================================
const productsGrid = document.getElementById('products-grid');
const cartCountElement = document.getElementById('cart-count');
const resultInfoElement = document.getElementById('result-info');
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');

// Elementos nuevos para el total
const cartSubtotalElement = document.getElementById('cart-subtotal');
const cartTaxElement = document.getElementById('cart-tax');
const cartTotalElement = document.getElementById('cart-total');

// ============================================
// LÓGICA DE TIENDA
// ============================================
function createProductCard(product) {
    const isAvailable = product.stock > 0;
    return `
        <article class="product-card" data-id="${product.id}">
            <div class="product-image-placeholder">[FOTO: ${product.title}]</div>
            <h3 class="product-title">${product.title}</h3>
            <p class="product-details">${product.brand} ${product.model} (${product.year})</p>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})" ${isAvailable ? '' : 'disabled'}>
                ${isAvailable ? 'Agregar' : 'Agotado'}
            </button>
        </article>
    `;
}

function renderProducts(list) {
    if (!productsGrid) return;
    resultInfoElement.textContent = `Mostrando ${list.length} piezas.`;
    if (list.length === 0) { productsGrid.innerHTML = '<p class="no-results">Sin resultados.</p>'; return; }
    productsGrid.innerHTML = list.map(createProductCard).join('');
    setTimeout(() => {
        document.querySelectorAll('.product-card').forEach((c, i) => setTimeout(() => c.classList.add('visible'), i * 50));
    }, 50);
}

function applyFilters() {
    const search = document.getElementById('main-search')?.value.toLowerCase() || '';
    const type = document.getElementById('filter-type')?.value || '';
    const brand = document.getElementById('filter-brand')?.value.toLowerCase() || '';
    
    const filtered = productsData.filter(p => {
        const textMatch = p.title.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search);
        const typeMatch = type === "" || p.type === type;
        const brandMatch = brand === "" || p.brand.toLowerCase().includes(brand);
        return textMatch && typeMatch && brandMatch;
    });
    renderProducts(filtered);
}

// ============================================
// LÓGICA CARRITO MEJORADA
// ============================================
let cart = JSON.parse(localStorage.getItem('yonkezon_cart')) || [];

function updateCartCount() {
    if(cartCountElement) cartCountElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function renderCartItems() {
    if(!cartItemsContainer) return;
    
    // 1. Renderizar Lista
    if(cart.length === 0) { 
        cartItemsContainer.innerHTML = '<p style="text-align:center; color:#777; margin-top:20px;">Tu carrito está vacío 🛒</p>'; 
        updateTotals(0);
        return; 
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-info">
                <h4>${item.title}</h4>
                <p>$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-controls">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="btn-trash" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
    
    // 2. Calcular Totales
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    updateTotals(subtotal);
}

function updateTotals(subtotal) {
    const tax = subtotal * 0.08; // 8% de impuesto
    const total = subtotal + tax;

    if(cartSubtotalElement) cartSubtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if(cartTaxElement) cartTaxElement.textContent = `$${tax.toFixed(2)}`;
    if(cartTotalElement) cartTotalElement.textContent = `$${total.toFixed(2)}`;
}

window.addToCart = function(id) {
    const prod = productsData.find(p => p.id === id);
    const item = cart.find(i => i.id === id);
    if(item) item.quantity++; else cart.push({...prod, quantity: 1});
    localStorage.setItem('yonkezon_cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`Agregado: ${prod.title}`, 'success');
};

window.updateQuantity = function(id, change) {
    const item = cart.find(i => i.id === id);
    if(item) {
        item.quantity += change;
        if(item.quantity <= 0) window.removeFromCart(id);
        else {
            localStorage.setItem('yonkezon_cart', JSON.stringify(cart));
            updateCartCount();
            renderCartItems();
        }
    }
};

window.removeFromCart = function(id) {
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem('yonkezon_cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
};

// Toggle Modal
window.toggleCart = function() {
    if(cartModal) {
        const isActive = cartModal.classList.contains('active');
        if(!isActive) {
            cartModal.classList.add('active');
            renderCartItems(); // Renderizar al abrir
        } else {
            cartModal.classList.remove('active');
        }
    }
};

// Cerrar al dar clic fuera
if(cartModal) {
    cartModal.addEventListener('click', (e) => {
        if(e.target === cartModal) toggleCart();
    });
}

// PROCESAR PAGO (NUEVO)
window.processCheckout = function() {
    if (cart.length === 0) {
        showNotification("Agrega productos antes de pagar", "error");
        return;
    }

    // Obtener método de pago seleccionado
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    const paymentMethod = selectedPayment ? selectedPayment.value : 'desconocido';
    
    let mensaje = "";
    if(paymentMethod === 'card') mensaje = "Conectando con banco...";
    if(paymentMethod === 'paypal') mensaje = "Redirigiendo a PayPal...";
    if(paymentMethod === 'cash') mensaje = "Generando orden de recolección...";

    showNotification(mensaje, "success");

    // Simular proceso
    const btn = document.querySelector('.checkout-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    btn.disabled = true;

    setTimeout(() => {
        alert(`¡Orden confirmada!\n\nMétodo: ${paymentMethod.toUpperCase()}\nGracias por comprar en Yonkezon.`);
        cart = [];
        localStorage.setItem('yonkezon_cart', JSON.stringify(cart));
        updateCartCount();
        renderCartItems();
        toggleCart(); // Cerrar modal
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 2000);
};

function showNotification(msg, type) {
    const div = document.createElement('div');
    div.className = `notification notification-${type}`;
    div.textContent = msg;
    div.style.cssText = "position:fixed; top:20px; right:20px; padding:15px; background:#333; color:white; border-radius:5px; z-index:11000; font-weight:bold; box-shadow:0 4px 10px rgba(0,0,0,0.3);";
    if(type === 'success') div.style.background = '#28a745';
    if(type === 'error') div.style.background = '#dc3545';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚗 Yonkezon Iniciado');
    if(productsGrid) renderProducts(productsData);
    updateCartCount();

    // Filtros
    document.getElementById('apply-filters')?.addEventListener('click', applyFilters);
    document.getElementById('search-button')?.addEventListener('click', applyFilters);

    // Eventos Carrito
    document.getElementById('cart-link')?.addEventListener('click', (e) => { e.preventDefault(); toggleCart(); });
    document.getElementById('close-cart')?.addEventListener('click', toggleCart);

    // Login Modal
    const loginModal = document.getElementById('login-modal');
    const accountLink = document.getElementById('account-link');
    if(accountLink && loginModal) {
        accountLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'flex';
        });
        loginModal.addEventListener('click', (e) => {
            if(e.target === loginModal) loginModal.style.display = 'none';
        });
    }

    // Navegación Vistas
    const viewShop = document.getElementById('view-shop');
    const viewVendor = document.getElementById('view-vendor');
    const navLogo = document.getElementById('nav-logo');
    const navVender = document.getElementById('nav-vender');

    navVender?.addEventListener('click', (e) => {
        e.preventDefault();
        viewShop.style.display = 'none';
        viewVendor.style.display = 'flex';
    });

    navLogo?.addEventListener('click', (e) => {
        e.preventDefault();
        viewVendor.style.display = 'none';
        viewShop.style.display = 'flex';
    });
});