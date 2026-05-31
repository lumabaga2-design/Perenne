const carritoModulo = {
    // Array que almacena productos en el carrito
    items: [],

    init() {
        // captura envío del formulario
        const form = document.getElementById('formCarrito');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.agregarDesdeFormulario();
            });
        }
        
        this.renderizarCarrito();
    },

    // Agregar producto desde el formulario
    agregarDesdeFormulario() {
        const productId = parseInt(document.getElementById('carritoProducto').value);
        const cantidad = parseInt(document.getElementById('carrritoCantidad').value);

        if (productId && cantidad > 0) {
            // Buscar el producto en la lista de productos
            const producto = productosModulo.productos.find(p => p.product_id === productId);

            if (producto) {
                this.agregarProducto(productId, producto.name, producto.price, cantidad);
            }
        }
    },

    // Agregar producto al carrito
    agregarProducto(productId, nombre, precio, cantidad) {
        // Buscar si el producto ya está en el carrito
        const itemExistente = this.items.find(item => item.product_id === productId);

        if (itemExistente) {
            // Si ya existe  aumentar cantidad
            itemExistente.cantidad += cantidad;
        } else {
            // Si no existe agregarlo
            this.items.push({
                product_id: productId,
                nombre: nombre,
                precio: parseFloat(precio),
                cantidad: cantidad
            });
        }

        alert(`${nombre} agregado al carrito`);
        
        // Limpiar el formulario
        const form = document.getElementById('formCarrito');
        if (form) form.reset();

        // Actualizar vista del carrito
        this.renderizarCarrito();
    },

    // Renderizar carrito
    renderizarCarrito() {
        const contenedor = document.getElementById('carritoLista');

        if (this.items.length === 0) {
            contenedor.innerHTML = '<div class="empty-state"><p>Tu carrito está vacío</p></div>';
            return;
        }

        let html = '<table><thead><tr>';
        html += '<th>Producto</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th><th>Acciones</th>';
        html += '</tr></thead><tbody>';

        let total = 0;

        // Recorrer cada item del carrito
        this.items.forEach((item, index) => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;

            html += '<tr>';
            html += `<td>${item.nombre}</td>`;
            html += `<td><input type="number" value="${item.cantidad}" min="1" onchange="carritoModulo.cambiarCantidad(${index}, this.value)"></td>`;
            html += `<td>$${parseFloat(item.precio).toLocaleString()}</td>`;
            html += `<td>$${subtotal.toLocaleString()}</td>`;
            html += `<td><button class="btn-small btn-danger" onclick="carritoModulo.eliminarDelCarrito(${index})">Eliminar</button></td>`;
            html += '</tr>';
        });

        // Fila de total
        html += '<tr style="font-weight: bold; background: #f3f4f6;">';
        html += '<td colspan="3" style="text-align: right;">TOTAL:</td>';
        html += `<td>$${total.toLocaleString()}</td>`;
        html += '<td></td>';
        html += '</tr>';

        html += '</tbody></table>';

        // Botón para proceder al pago
        html += `<button class="btn-success" style="margin-top: 20px; width: 100%;" onclick="carritoModulo.irAlPago(${total})">Proceder al Pago ($${total.toLocaleString()})</button>`;

        contenedor.innerHTML = html;
    },

    // Cambiar cantidad en el carrito
    cambiarCantidad(index, nuevaCantidad) {
        const cantidad = parseInt(nuevaCantidad);
        if (cantidad > 0) {
            this.items[index].cantidad = cantidad;
            this.renderizarCarrito();
        }
    },

    // Eliminar producto del carrito
    eliminarDelCarrito(index) {
        this.items.splice(index, 1);
        this.renderizarCarrito();
    },

    // Ir al proceso de pago
    irAlPago(total) {
        alert(`Procederás a pagar: $${total.toLocaleString()}\n\nSerás redirigido al módulo de pagos`);
        
    }
};

