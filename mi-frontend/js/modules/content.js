const contenidoModulo = {
    contenidos: [],

    init() {
        document.getElementById('formContenido').addEventListener('submit', (e) => {
            e.preventDefault();
            this.publicarContenido();
        });
        this.cargarContenido();
    },

    async publicarContenido() {
        // Obtener datos del formulario
        const titulo = document.getElementById('contenidoTitulo').value;
        const descripcion = document.getElementById('contenidoDescripcion').value;
        const tipo = document.getElementById('contenidoTipo').value;
        const url = document.getElementById('contenidoUrl').value;

        const datosContenido = {
            user_id: 1,
            title: titulo,
            description: descripcion,
            content_type: tipo,
            file_url: url,
            is_published: true
        };

        try {
            const respuesta = await fetch('http://localhost:8080/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosContenido)
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                document.getElementById('formContenido').reset();
                alert('Contenido publicado correctamente');
                this.cargarContenido();
                
                // También actualizar el feed
                if (typeof feedModulo !== 'undefined') {
                    feedModulo.cargarFeed();
                }
            } else {
                alert('Error: ' + datos.error);
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    },


    renderizarContenido() {
        const contenedor = document.getElementById('contenidoLista');

        if (this.contenidos.length === 0) {
            contenedor.innerHTML = '<div class="empty-state"><p>No hay contenido publicado</p></div>';
            return;
        }


        let html = '<div class="lista-items">';

        this.contenidos.forEach(contenido => {
            html += '<div class="item">';
            
            // Encabezado con tipo e icono
            html += '<div class="item-header">';
            html += `<span style="font-size: 1.2rem; margin-right: 10px;">${tipos[contenido.content_type] || '📄'}</span>`;
            html += `<span>${contenido.content_type.toUpperCase()}</span>`;
            html += '</div>';
            
            // Título
            html += `<div class="item-title">${contenido.title}</div>`;
            
            // Descripción
            html += `<div style="color: #6b7280; margin: 10px 0;">${contenido.description || 'Sin descripción'}</div>`;
            
            // Botón para eliminar
            html += '<div class="item-actions">';
            html += `<button class="btn-small btn-danger" onclick="contenidoModulo.eliminarContenido(${contenido.content_id})">Eliminar</button>`;
            html += '</div>';
            
            html += '</div>';
        });

        html += '</div>';
        contenedor.innerHTML = html;
    },

    async eliminarContenido(contentId) {
        if (!confirm('¿Estás seguro de que deseas eliminar este contenido?')) return;

        try {
            const respuesta = await fetch(`http://localhost:8080/api/content/${contentId}`, {
                method: 'DELETE'
            });

            if (respuesta.ok) {
                alert('Contenido eliminado correctamente');
                this.cargarContenido();
            } else {
                alert('Error al eliminar contenido');
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    }
};
