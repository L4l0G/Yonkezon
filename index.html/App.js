// ============================================
// CURSOR PERSONALIZADO ANIMADO
// ============================================
const cursor = document.querySelector('.custom-cursor');
const cursorDot = document.querySelector('.custom-cursor-dot');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let dotX = 0;
let dotY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    dotX = e.clientX - 4;
    dotY = e.clientY - 4;
    
    cursor.classList.add('active');
});

// Animación suave del cursor
function animateCursor() {
    const speed = 0.2;
    
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    
    cursor.style.left = cursorX - 12 + 'px';
    cursor.style.top = cursorY - 12 + 'px';
    
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top = dotY + 'px';
    
    requestAnimationFrame(animateCursor);
}

animateCursor();

// Efecto hover en elementos interactivos
document.addEventListener('mouseover', (e) => {
    if (e.target.matches('a, button, input, select, .product-card')) {
        cursor.classList.add('hover');
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.matches('a, button, input, select, .product-card')) {
        cursor.classList.remove('hover');
    }
});

// ============================================
// BASE DE DATOS DE PRODUCTOS
// ============================================
const productsData = [
    { 
        id: 1, 
        title: "Motor 2.0L VVT-i Completo", 
        description: "Motor completo, baja kilometraje (60k millas), compatible con Corolla.", 
        price: 550.00, 
        stock: 3, 
        brand: "Toyota", 
        model: "Corolla", 
        year: 2010, 
        type: "motor", 
        condition: "Usado" 
    },
    { 
        id: 2, 
        title: "Transmisión Automática 4x4", 
        description: "Transmisión en buen estado, incluye convertidor. Ideal para trabajos pesados.", 
        price: 900.00, 
        stock: 1, 
        brand: "Ford", 
        model: "F-150", 
        year: 2005, 
        type: "transmision", 
        condition: "Usado" 
    },
    { 
        id: 3, 
        title: "Puerta Trasera Derecha Gris Plata", 
        description: "Puerta sin abolladuras mayores, incluye cristal y manija. Mínimos rayones.", 
        price: 150.00, 
        stock: 5, 
        brand: "Honda", 
        model: "Civic", 
        year: 2015, 
        type: "carroceria", 
        condition: "Usado" 
    },
    { 
        id: 4, 
        title: "Kit de Freno Delantero (Discos y Calipers)", 
        description: "Discos seminuevos, calipers revisados. Listo para instalar.", 
        price: 85.50, 
        stock: 0,
        brand: "Toyota", 
        model: "Camry", 
        year: 2012, 
        type: "frenos", 
        condition: "Usado" 
    },
    { 
        id: 5, 
        title: "Alternador de Alto Rendimiento", 
        description: "Alternador 150 Amp, revisado y garantizado. Compatible con varias marcas.", 
        price: 120.00, 
        stock: 7, 
        brand: "Universal", 
        model: "NA", 
        year: 2008, 
        type: "electrico", 
        condition: "Reacondicionado" 
    },
    { 
        id: 6, 
        title: "Parachoques Delantero Negro", 
        description: "Defensa frontal con ligeros rasguños, pintura original, incluye rejillas.", 
        price: 220.00, 
        stock: 2, 
        brand: "Honda", 
        model: "CR-V", 
        year: 2018, 
        type: "carroceria", 
        condition: "Usado" 
    }
];

// ============================================
// REFERENCIAS AL DOM
// ============================================
const productsGrid = document.getElementById('products-grid');
const cartCountElement = document.getElementById('cart-count');
const resultInfoElement = document.getElementById('result-info');
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');

// ============================================
// FUNCIONES DE RENDERIZADO
// ============================================
function createProductCard(product) {
    const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
    const stockText = product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado';
    const isAvailable = product.stock > 0;

    return `
        <article class="product-card" data-id="${product.id}">
            <div class="product-image-placeholder">
                [Yonkezon: Foto de ${product.title} - ${product.brand} ${product.model}]
            </div>
            <h3 class="product-title">${product.title}</h3>
            <p class="product-details">
                ${product.brand} ${product.model} (${product.year}) | Tipo: ${product.type}
            </p>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <p class="product-details">
                <span class="product-stock ${stockClass}">${stockText}</span>
            </p>
            <button 
                class="add-to-cart-btn" 
                data-product-id="${product.id}" 
                ${isAvailable ? '' : 'disabled'}
                onclick="addToCart(${product.id})"
            >
                ${isAvailable ? 'Agregar al Carrito' : 'No Disponible'}
            </button>
        </article>
    `;
}

function renderProducts(productsToRender) {
    resultInfoElement.textContent = `Mostrando ${productsToRender.length} piezas disponibles.`;
    
    if (productsToRender.length === 0) {
        productsGrid.innerHTML = '<p class="no-results">No se encontraron piezas con los filtros aplicados. Intenta con una búsqueda diferente.</p>';
        return;
    }
    
    const html = productsToRender.map(createProductCard).join('');
    productsGrid.innerHTML = html;
    
    // Aplicar animación de aparición con delay escalonado
    setTimeout(() => {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 100);
        });
    }, 50);
}

// ============================================
// SISTEMA DE FILTRADO
// ============================================
function applyFilters() {
    const searchText = document.getElementById('main-search').value.toLowerCase();
    const typeFilter = document.getElementById('filter-type').value;
    const brandFilter = document.getElementById('filter-brand').value.toLowerCase();
    const modelFilter = document.getElementById('filter-model').value.toLowerCase();
    const yearMin = parseInt(document.getElementById('filter-year-min').value) || 1900;
    const yearMax = parseInt(document.getElementById('filter-year-max').value) || 2099;

    const filteredProducts = productsData.filter(product => {
        const textMatch = (
            product.title.toLowerCase().includes(searchText) ||
            product.description.toLowerCase().includes(searchText) ||
            product.brand.toLowerCase().includes(searchText) ||
            product.model.toLowerCase().includes(searchText)
        );

        const typeMatch = (typeFilter === "" || product.type === typeFilter);
        const brandMatch = (brandFilter === "" || product.brand.toLowerCase().includes(brandFilter));
        const modelMatch = (modelFilter === "" || product.model.toLowerCase().includes(modelFilter));
        const yearMatch = (product.year >= yearMin && product.year <= yearMax);

        return textMatch && typeMatch && brandMatch && modelMatch && yearMatch;
    });

    renderProducts(filteredProducts);
}

// ============================================
// SISTEMA DE CARRITO
// ============================================
let cart = JSON.parse(localStorage.getItem('yonkezon_cart')) || [];

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    
    // Animación del badge cuando cambia
    cartCountElement.style.animation = 'none';
    setTimeout(() => {
        cartCountElement.style.animation = 'pulse 2s ease-in-out infinite';
    }, 10);
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = `$${total.toFixed(2)}`;
}

function renderCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Tu carrito está vacío</p>';
        updateCartTotal();
        return;
    }

    const html = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.title}</h4>
                <p>$${item.price.toFixed(2)} c/u</p>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span style="padding: 0 10px; font-weight: bold;">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    cartItemsContainer.innerHTML = html;
    updateCartTotal();
}

window.addToCart = function(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product || product.stock <= 0) {
        showNotification('Lo sentimos, este producto está agotado.', 'error');
        return;
    }

    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem) {
        if (cartItem.quantity < product.stock) {
            cartItem.quantity++;
        } else {
            showNotification('Has alcanzado el límite de stock disponible para esta pieza.', 'warning');
            return;
        }
    } else {
        cart.push({
            id: productId,
            title: product.title,
            price: product.price,
            quantity: 1
        });
    }

    localStorage.setItem('yonkezon_cart', JSON.stringify(cart));
    updateCartCount();
    
    // Animación del botón
    const button = event.target;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 200);
    
    showNotification(`✓ Se agregó "${product.title}" al carrito`, 'success');
};

window.updateQuantity = function(productId, change) {
    const product = productsData.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);
    
    if (!cartItem) return;
    
    const newQuantity = cartItem.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    if (newQuantity > product.stock) {
        showNotification('No hay suficiente stock disponible', 'warning');
        return;
    }
    
    cartItem.quantity = newQuantity;
    localStorage.setItem('yonkezon_cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
};

window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('yonkezon_cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
    showNotification('Producto eliminado del carrito', 'info');
};

window.toggleCart = function() {
    cartModal.classList.toggle('active');
    if (cartModal.classList.contains('active')) {
        renderCartItems();
    }
};

// ============================================
// SISTEMA DE NOTIFICACIONES
// ============================================
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        padding: '15px 25px',
        borderRadius: '10px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: '10000',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        animation: 'slideInRight 0.4s ease, fadeOut 0.4s ease 2.6s',
        maxWidth: '300px'
    });
    
    // Colores según tipo
    const colors = {
        success: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        error: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
        warning: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
        info: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Agregar animación CSS para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
            transform: translateX(400px);
        }
    }
`;
document.head.appendChild(style);

// ============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚗 Yonkezon - Sistema de repuestos iniciado');
    
    // Renderizar productos iniciales
    renderProducts(productsData);
    
    // Inicializar contador del carrito
    updateCartCount();
    
    // Event Listeners para filtros
    const filterInputs = document.querySelectorAll('#sidebar-filters input, #sidebar-filters select');
    filterInputs.forEach(input => {
        input.addEventListener('input', applyFilters);
    });
    
    // Event Listeners para búsqueda
    document.getElementById('search-button').addEventListener('click', applyFilters);
    document.getElementById('main-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    // Event Listener para botón de aplicar filtros
    document.getElementById('apply-filters').addEventListener('click', () => {
        applyFilters();
        showNotification('Filtros aplicados correctamente', 'success');
    });
    
    // Event Listeners para carrito
    document.getElementById('cart-link').addEventListener('click', (e) => {
        e.preventDefault();
        toggleCart();
    });
    
    document.getElementById('close-cart').addEventListener('click', () => {
        toggleCart();
    });
    
    // Cerrar modal al hacer clic fuera
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            toggleCart();
        }
    });
    
    // Event Listeners para otros botones del header
    document.getElementById('account-link').addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('Panel de usuario en construcción', 'info');
    });
    
    document.getElementById('vendor-link').addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('Panel de vendedor en construcción', 'info');
    });
    
    // Event Listener para botón de checkout
    document.querySelector('.checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('Tu carrito está vacío', 'warning');
            return;
        }
        showNotification('Procesando pago... (Función en desarrollo)', 'info');
    });
    
    // Animación de entrada para los elementos
    setTimeout(() => {
        document.querySelector('.main-header').style.opacity = '1';
        document.querySelector('.sidebar-filters').style.opacity = '1';
        document.querySelector('.product-results').style.opacity = '1';
    }, 100);
    
    console.log('✅ Sistema listo. Productos cargados:', productsData.length);
    console.log('🛒 Artículos en carrito:', cart.length);
});