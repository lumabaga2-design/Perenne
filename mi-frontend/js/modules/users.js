// Objeto que almacena el estado de usuarios
const usuariosModulo = {
    // Array que guarda todos los usuarios
    usuarios: [],

    // Inicializar el módulo
    init() {
        // Capturar el evento submit del formulario
        document.getElementById('formUsuario').addEventListener('submit', (e) => {
            e.preventDefault(); // Evitar recarga de página
            this.crearUsuario();
        });

        // Cargar usuarios cuando se abre el módulo
        this.cargarUsuarios();
    },

    // Crear nuevo usuario
    async crearUsuario() {
        // Obtener valores del formulario
        const nombre = document.getElementById('usuarioNombre').value;
        const apellido = document.getElementById('usuarioApellido').value;
        const email = document.getElementById('usuarioEmail').value;
        const telefono = document.getElementById('usuarioTelefono').value;
        const contrasena = document.getElementById('usuarioContrasena').value;
        const rol = document.getElementById('usuarioRol').value;

        // Objeto con los datos del usuario
        const datosUsuario = {
            first_name: nombre,
            last_name: apellido,
            email: email,
            phone: telefono,
            password: contrasena,
            role: rol
        };

        try {
            // Enviar datos al servidor (API Node.js)
            const respuesta = await fetch('http://localhost:8080/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosUsuario)
            });

            // respuesta como JSON
            const datos = await respuesta.json();

            if (respuesta.ok) {
                // Si fue exitoso limpiar el formulario
                document.getElementById('formUsuario').reset();
                
                // Mostrar mensaje de éxito
                alert('Usuario registrado correctamente');
                
                // Recargar la lista de usuarios
                this.cargarUsuarios();
            } else {
                alert('Error: ' + datos.error);
            }
        } catch (error) {
            // Si hay error de conexión
            alert('Error de conexión: ' + error.message);
        }
    },

    // Cargar todos los usuarios
    async cargarUsuarios() {
        try {
            // Hacer petición GET a la API
            const respuesta = await fetch('http://localhost:8080/api/users');
            const usuarios = await respuesta.json();

            // Guardar usuarios en el estado
            this.usuarios = usuarios;

            // Renderizar la lista
            this.renderizarUsuarios();
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    },

    // Mostrar usuarios en HTML
    renderizarUsuarios() {
        const contenedor = document.getElementById('usuariosLista');

        // Si no hay usuarios, mostrar mensaje vacío
        if (this.usuarios.length === 0) {
            contenedor.innerHTML = '<div class="empty-state"><p>No hay usuarios registrados</p></div>';
            return;
        }

        // Crear tabla con los usuarios
        let html = '<table><thead><tr>';
        html += '<th>Nombre</th><th>Email</th><th>Teléfono</th><th>Rol</th><th>Acciones</th>';
        html += '</tr></thead><tbody>';

        // Recorrer cada usuario
        this.usuarios.forEach(usuario => {
            html += '<tr>';
            html += `<td>${usuario.first_name} ${usuario.last_name}</td>`;
            html += `<td>${usuario.email}</td>`;
            html += `<td>${usuario.phone || '-'}</td>`;
            html += `<td><span style="background: ${usuario.role === 'collaborator' ? '#10b981' : '#7c3aed'}; color: white; padding: 4px 8px; border-radius: 4px;">${usuario.role}</span></td>`;
            html += `<td><button class="btn-small btn-danger" onclick="usuariosModulo.eliminarUsuario(${usuario.user_id})">Eliminar</button></td>`;
            html += '</tr>';
        });

        html += '</tbody></table>';
        contenedor.innerHTML = html;
    },
    
};
