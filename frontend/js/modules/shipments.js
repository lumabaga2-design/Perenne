const enviosModulo = {
    envios: [],

    init() {
        document.getElementById('formEnvio').addEventListener('submit', (e) => {
            e.preventDefault();
            this.crearEnvio();
        });
        
        // Cargar clientes seleccion
        this.actualizarSelectoClientes();
        this.cargarEnvios();
    },

    // Cargar clientes en selección
    actualizarSelectoClientes() {
        const select = document.getElementById('envioCliente');
        
        if (clientesModulo.clientes.length > 0) {
            select.innerHTML = '<option value="">Selecciona cliente...</option>';
            
            clientesModulo.clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.customer_id;
                option.textContent = `${cliente.first_name} ${cliente.last_name}`;
                select.appendChild(option);
            });
        }
    },

    // Crear nuevo envío
    async crearEnvio() {
        // Obtener datos del formulario
        const clienteId = parseInt(document.getElementById('envioCliente').value);
        const direccion = document.getElementById('envioDireccion').value;
        const ciudad = document.getElementById('envioCiudad').value;

        if (!clienteId || !direccion || !ciudad) {
            alert('Por favor completa todos los campos');
            return;
        }

        const datosEnvio = {
            customer_id: clienteId,
            address: direccion,
            city: ciudad,
            department: 'Departamento'
        };

        try {
            const respuesta = await fetch('http://localhost:3000/api/shipments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosEnvio)
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                document.getElementById('formEnvio').reset();
                alert(`Envío creado correctamente\nCódigo de rastreo: ${datos.tracking_code}`);
                this.cargarEnvios();
            } else {
                alert('Error: ' + datos.error);
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    },

    // Cargar todos los envíos
    async cargarEnvios() {
        try {
            const respuesta = await fetch('http://localhost:3000/api/shipments');
            const envios = await respuesta.json();
            this.envios = envios;
            this.renderizarEnvios();
        } catch (error) {
            console.error('Error al cargar envíos:', error);
        }
    },

    // Mostrar envíos
    renderizarEnvios() {
        const contenedor = document.getElementById('enviosLista');

        if (this.envios.length === 0) {
            contenedor.innerHTML = '<div class="empty-state"><p>No hay envíos registrados</p></div>';
            return;
        }

        // Estados posibles de un envío
        const estados = {
            preparing: 'Preparación',
            shipped: 'Enviado',
            in_transit: 'En Tránsito',
            delivered: 'Entregado'
        };

        let html = '<table><thead><tr>';
        html += '<th>Código de Rastreo</th><th>Destino</th><th>Estado</th><th>Acciones</th>';
        html += '</tr></thead><tbody>';

        this.envios.forEach(envio => {
            html += '<tr>';
            html += `<td><strong>${envio.tracking_code}</strong></td>`;
            html += `<td>${envio.city}</td>`;
            html += `<td><span style="background: #7c3aed; color: white; padding: 4px 8px; border-radius: 4px;">${estados[envio.status] || envio.status}</span></td>`;
            html += `<td><button class="btn-small" style="background: #f59e0b;" onclick="enviosModulo.siguientestado(${envio.shipment_id})">Siguiente Estado</button>`;
            html += ` <button class="btn-small btn-danger" onclick="enviosModulo.eliminarEnvio(${envio.shipment_id})">Eliminar</button></td>`;
            html += '</tr>';
        });

        html += '</tbody></table>';
        contenedor.innerHTML = html;
    },

    // Cambiar al siguiente estado
    async siguientestado(shipmentId) {
        const envio = this.envios.find(e => e.shipment_id === shipmentId);
        
        if (!envio) return;

        // Estados en secuencia
        const secuencia = ['preparing', 'shipped', 'in_transit', 'delivered'];
        const indiceActual = secuencia.indexOf(envio.status);
        const nuevoEstado = secuencia[(indiceActual + 1) % secuencia.length];

        try {
            const respuesta = await fetch(`http://localhost:3000/api/shipments/${shipmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nuevoEstado })
            });

            if (respuesta.ok) {
                alert(`Estado actualizado a: ${nuevoEstado}`);
                this.cargarEnvios();
            } else {
                alert('Error al actualizar estado');
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    },

    // Eliminar envío
    async eliminarEnvio(shipmentId) {
        if (!confirm('¿Estás seguro?')) return;

        try {
            const respuesta = await fetch(`http://localhost:3000/api/shipments/${shipmentId}`, {
                method: 'DELETE'
            });

            if (respuesta.ok) {
                alert('Envío eliminado correctamente');
                this.cargarEnvios();
            } else {
                alert('Error al eliminar envío');
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    }
};
