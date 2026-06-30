const pagosModulo = {
    pagos: [],

    init() {
        document.getElementById('formPago').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarPago();
        });
        
        // Cargar usuarios para el selector
        this.actualizarSelectoUsuarios();
        this.cargarPagos();
    },

    // Cargar usuarios en el selector
    actualizarSelectoUsuarios() {
        const select = document.getElementById('pagoUsuario');
        
        // Obtener usuarios del módulo de usuarios
        if (usuariosModulo.usuarios.length > 0) {
            select.innerHTML = '<option value="">Selecciona usuario...</option>';
            
            usuariosModulo.usuarios.forEach(usuario => {
                const option = document.createElement('option');
                option.value = usuario.user_id;
                option.textContent = `${usuario.first_name} ${usuario.last_name}`;
                select.appendChild(option);
            });
        }
    },

    // Registrar nuevo pago
    async registrarPago() {
        // Obtener datos del formulario
        const usuarioId = parseInt(document.getElementById('pagoUsuario').value);
        const monto = parseFloat(document.getElementById('pagoMonto').value);
        const metodo = document.getElementById('pagoMetodo').value;

        if (!usuarioId || !monto) {
            alert('Por favor completa todos los campos');
            return;
        }

        const datosPago = {
            user_id: usuarioId,
            amount: monto,
            payment_method: metodo,
            status: 'pending'
        };

        try {
            const respuesta = await fetch('http://localhost:8080/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosPago)
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                document.getElementById('formPago').reset();
                alert('Pago registrado correctamente');
                this.cargarPagos();
            } else {
                alert('Error: ' + datos.error);
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    },

    // Cargar todos los pagos
    async cargarPagos() {
        try {
            const respuesta = await fetch('http://localhost:8080/api/payments');
            const pagos = await respuesta.json();
            this.pagos = pagos;
            this.renderizarPagos();
        } catch (error) {
            console.error('Error al cargar pagos:', error);
        }
    },

    // Mostrar pagos en tabla
    renderizarPagos() {
        const contenedor = document.getElementById('pagosLista');

        if (this.pagos.length === 0) {
            contenedor.innerHTML = '<div class="empty-state"><p>No hay pagos registrados</p></div>';
            return;
        }

        // Mapeo de colores según estado
        const coloresEstado = {
            pending: '#f59e0b', // Naranja
            completed: '#10b981', // Verde
            rejected: '#ef4444' // Rojo
        };

        let html = '<table><thead><tr>';
        html += '<th>Monto</th><th>Método</th><th>Estado</th><th>Referencia</th><th>Fecha</th><th>Acciones</th>';
        html += '</tr></thead><tbody>';

        this.pagos.forEach(pago => {
            html += '<tr>';
            html += `<td>$${parseFloat(pago.amount).toLocaleString()}</td>`;
            html += `<td>${pago.payment_method}</td>`;
            html += `<td><span style="background: ${coloresEstado[pago.status]}; color: white; padding: 4px 8px; border-radius: 4px;">${pago.status}</span></td>`;
            html += `<td>${pago.reference || '-'}</td>`;
            html += `<td>${new Date(pago.payment_date).toLocaleDateString()}</td>`;
            html += `<td><button class="btn-small btn-danger" onclick="pagosModulo.eliminarPago(${pago.payment_id})">Eliminar</button></td>`;
            html += '</tr>';
        });

        html += '</tbody></table>';
        contenedor.innerHTML = html;
    },

    // Eliminar pago
    async eliminarPago(paymentId) {
        if (!confirm('¿Estás seguro?')) return;

        try {
            const respuesta = await fetch(`http://localhost:8080/api/payments/${paymentId}`, {
                method: 'DELETE'
            });

            if (respuesta.ok) {
                alert('Pago eliminado correctamente');
                this.cargarPagos();
            } else {
                alert('Error al eliminar pago');
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    }
};
