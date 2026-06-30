const feedModulo = {
    publicaciones: [],

    init() {
        this.cargarFeed();
    },

    async cargarFeed() {
        try {
            // La API de feed combina productos y contenido
            const respuesta = await fetch('http://localhost:8080/api/feed');
            const publicaciones = await respuesta.json();
            this.publicaciones = publicaciones;
            this.renderizarFeed();
        } catch (error) {
            console.error('Error al cargar feed:', error);
        }
    },

    renderizarFeed() {
        const contenedor = document.getElementById('feedLista');

        if (this.publicaciones.length === 0) {
            contenedor.innerHTML = '<div class="empty-state"><p>El feed está vacío. ¡Publica algo!</p></div>';
            return;
        }

        let html = '<div class="lista-items">';

        // Recorrer cada publicación
        this.publicaciones.forEach(item => {
            html += '<div class="item">';
            
            // Determinar si es producto o contenido
            const esProducto = item.price !== null;
            const tipo = esProducto ? 'PRODUCTO' : 'CONTENIDO';
            
            html += `<div style="background: #7c3aed; color: white; padding: 5px 10px; border-radius: 4px; display: inline-block; font-size: 0.8rem; font-weight: bold; margin-bottom: 10px;">${tipo}</div>`;
            
            // Título
            html += `<div class="item-title">${item.name || item.title}</div>`;
            
            // Descripción
            html += `<div style="color: #6b7280; margin: 10px 0;">${item.description}</div>`;
            
            // Si es producto, mostrar precio y stock
            if (esProducto) {
                html += `<div style="color: #7c3aed; font-size: 1.3rem; font-weight: bold; margin: 10px 0;">$${parseFloat(item.price).toLocaleString()}</div>`;
                html += `<div style="color: #6b7280;">Stock disponible: ${item.stock}</div>`;
            }
            
            html += '</div>';
        });

        html += '</div>';
        contenedor.innerHTML = html;
    }
};
