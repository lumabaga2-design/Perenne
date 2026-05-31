const clientesModulo = {
    clientes: [],

    init() {
        document.getElementById('formCliente').addEventListener('submit', (e) => {
            e.preventDefault();
            this.crearCliente();
        });
        this.cargarClientes();
    },

    async crearCliente() {
        // Obtener datos del formulario
        const nombre = document.getElementById('clienteNombre').value;
        const apellido = document.getElementById('clienteApellido').value;
        const email = document.getElementById('clienteEmail').value;
        const telefono = document.getElementById('clienteTelefono').value;

        const datosCliente = {
            first_name: nombre,
            last_name: apellido,
            email: email,
            phone: telefono
        };

        try {
            const respuesta = await fetch('http://localhost:3000/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosCliente)
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                document.getElementById('formCliente').reset();
                alert('Cliente registrado correctamente');
                this.cargarClientes();
            } else {
                alert('Error: ' + datos.error);
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    },


    renderizarClientes() {
        const contenedor = document.getElementById('clientesLista');

        if (this.clientes.length === 0) {
            contenedor.innerHTML = '<div class="empty-state"><p>No hay clientes registrados</p></div>';
            return;
        }

        let html = '<table><thead><tr>';
        html += '<th>Nombre</th><th>Email</th><th>Teléfono</th><th>Acciones</th>';
        html += '</tr></thead><tbody>';

        this.clientes.forEach(cliente => {
            html += '<tr>';
            html += `<td>${cliente.first_name} ${cliente.last_name}</td>`;
            html += `<td>${cliente.email}</td>`;
            html += `<td>${cliente.phone || '-'}</td>`;
            html += `<td><button class="btn-small btn-danger" onclick="clientesModulo.eliminarCliente(${cliente.customer_id})">Eliminar</button></td>`;
            html += '</tr>';
        });

        html += '</tbody></table>';
        contenedor.innerHTML = html;
    },

    async eliminarCliente(customerId) {
        if (!confirm('¿Estás seguro?')) return;

        try {
            const respuesta = await fetch(`http://localhost:3000/api/customers/${customerId}`, {
                method: 'DELETE'
            });

            if (respuesta.ok) {
                alert('Cliente eliminado correctamente');
                this.cargarClientes();
            } else {
                alert('Error al eliminar cliente');
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    }
};
