const interaccionesModulo = {
    init() {
        this.renderizarEjemplo();
    },

    // Renderizar un ejemplo de producto con interacciones
    renderizarEjemplo() {
        const contenedor = document.getElementById('interaccionesLista');

        // HTML de ejemplo
        let html = '<div class="item" style="background: white; border: 2px solid #7c3aed;">';
        html += '<div class="item-title">Producto Ejemplo - $50,000</div>';
        html += '<div style="color: #6b7280; margin: 15px 0;">Este es un producto de ejemplo. Puedes interactuar con él dando me gusta, comentando o compartiendo.</div>';
        
        // Sección de interacciones
        html += '<div style="display: flex; gap: 20px; margin-top: 20px; padding-top: 15px; border-top: 2px solid #e5e7eb;">';
        
        // Like
        html += '<button onclick="interaccionesModulo.darLike(1)" style="background: none; border: none; cursor: pointer; color: #ef4444; font-weight: bold;">';
        html += '❤️ Me gusta (12)';
        html += '</button>';
        
        // Comentarios
        html += '<button onclick="interaccionesModulo.abrirComentarios(1)" style="background: none; border: none; cursor: pointer; color: #7c3aed; font-weight: bold;">';
        html += '💬 Comentarios (5)';
        html += '</button>';
        
        // Compartir
        html += '<button onclick="interaccionesModulo.compartir(1)" style="background: none; border: none; cursor: pointer; color: #10b981; font-weight: bold;">';
        html += '📤 Compartir';
        html += '</button>';
        
        html += '</div>';
        html += '</div>';

        contenedor.innerHTML = html;
    },

    // Dar "me gusta"
    async darLike(itemId) {
        try {
            const respuesta = await fetch('http://localhost:8080/api/interactions/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: 1,
                    item_id: itemId,
                    item_type: 'product'
                })
            });

            if (respuesta.ok) {
                alert('Me gusta agregado!');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    },

    // Abrir sección de comentarios
    abrirComentarios(itemId) {
        const comentario = prompt('Escribe tu comentario:');
        
        if (comentario) {
            this.crearComentario(itemId, comentario);
        }
    },

    // Crear comentario
    async crearComentario(itemId, texto) {
        try {
            const respuesta = await fetch('http://localhost:8080/api/interactions/comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: 1,
                    item_id: itemId,
                    item_type: 'product',
                    body: texto
                })
            });

            if (respuesta.ok) {
                alert('Comentario agregado!');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    },

    // Compartir contenido
    async compartir(itemId) {
        try {
            const respuesta = await fetch('http://localhost:8080/api/interactions/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: 1,
                    item_id: itemId,
                    item_type: 'product'
                })
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                const url = `http://localhost:8080/shared/${datos.share_code}`;
                alert(`Compartido! Código: ${datos.share_code}\n\nURL: ${url}`);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }
};
