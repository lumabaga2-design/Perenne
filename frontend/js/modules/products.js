const productosModulo = {
    productos: [],

    init() {
        document.getElementById('formProducto').addEventListener('submit', (e) => {
            e.preventDefault();
            this.crearProducto();
        });
        this.cargarProductos();
    },

    async crearProducto() {
        // Obtener datos del formulario
        const nombre = document.getElementById('productoNombre').value;
        const precio = parseFloat(document.getElementById('productoPrecio').value);
        const stock = parseInt(document.getElementById('productoStock').value);
        const imagen = document.getElementById('productoImagen').value;
        const descripcion = document.getElementById('productoDescripcion').value;

        const datosProducto = {
            user_id: 1, // En la práctica, esto vendría del usuario autenticado
            name: nombre,
            description: descripcion,
            price: precio,
            stock: stock,
            image_url: imagen,
            is_available: true
        };

        try {
            const respuesta = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosProducto)
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                document.getElementById('formProducto').reset();
                alert('Producto creado correctamente');
                this.cargarProductos();
            } else {
                alert('Error: ' + datos.error);
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    },

    async cargarProductos() {
        try {
            const respuesta = await fetch('http://localhost:3000/api/products');
            const productos = await respuesta.json();
            this.productos = productos;
            this.renderizarProductos();
            
            // Actualizar el selector del carrito
            this.actualizarSelectoCarrito();
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    },

    renderizarProductos() {
        const contenedor = document.getElementById('productosLista');

        if (this.productos.length === 0) {
            contenedor.innerHTML = '<div class="empty-state"><p>No hay productos disponibles</p></div>';
            return;
        }

        // Mostrar productos en una grid (cuadrícula)
        let html = '<div class="lista-items" style="grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); display: grid; gap: 20px;">';

        this.productos.forEach(producto => {
            html += '<div class="item">';
            
            // Si hay imagen, mostrarla; si no, mostrar un placeholder
            html += `<div style="height: 150px; background: linear-gradient(135deg, #7c3aed, #a855f7); border-radius: 8px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">`;
            html += producto.image_url ? `<img src="${producto.image_url}" style="width: 100%; height: 100%; object-fit: cover;">` : 'Producto';
            html += '</div>';
            
            // Nombre del producto
            html += `<div class="item-title">${producto.name}</div>`;
            
            // Precio
            html += `<div style="color: #7c3aed; font-size: 1.5rem; font-weight: bold; margin: 10px 0;">$${parseFloat(producto.price).toLocaleString()}</div>`;
            
            // Descripción
            html += `<div style="color: #6b7280; margin: 10px 0;">${producto.description || 'Sin descripción'}</div>`;
            
            // Stock
            html += `<div style="color: #6b7280; font-size: 0.9rem; margin: 10px 0;">Stock: ${producto.stock}</div>`;
            
            // Botones de acción
            html += '<div class="item-actions">';
            html += `<button class="btn-small btn-success" onclick="productosModulo.agregarAlCarrito(${producto.product_id}, '${producto.name}', ${producto.price})">Agregar</button>`;
            html += `<button class="btn-small btn-danger" onclick="productosModulo.eliminarProducto(${producto.product_id})">Eliminar</button>`;
            html += '</div>';
            
            html += '</div>';
        });

        html += '</div>';
        contenedor.innerHTML = html;
    },

    agregarAlCarrito(productId, nombre, precio) {
        // Pedir cantidad al usuario
        const cantidad = prompt(`¿Cuántos de "${nombre}" deseas agregar? (Precio: $${parseFloat(precio).toLocaleString()})`);
        
        if (cantidad && parseInt(cantidad) > 0) {
            // Guardar en el carrito
            carritoModulo.agregarProducto(productId, nombre, precio, parseInt(cantidad));
        }
    },

    async eliminarProducto(productId) {
        if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

        try {
            const respuesta = await fetch(`http://localhost:3000/api/products/${productId}`, {
                method: 'DELETE'
            });

            if (respuesta.ok) {
                alert('Producto eliminado correctamente');
                this.cargarProductos();
            } else {
                alert('Error al eliminar producto');
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    },

    actualizarSelectoCarrito() {
        // Este método actualiza el selector en el formulario del carrito
        // para que muestre los productos disponibles
        const select = document.getElementById('carritoProducto');
        
        if (!select) return;

        select.innerHTML = '<option value="">Selecciona un producto...</option>';

        this.productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.product_id;
            option.textContent = `${producto.name} - $${parseFloat(producto.price).toLocaleString()}`;
            select.appendChild(option);
        });
    }
};
