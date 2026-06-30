
const busquedaModulo = {
    resultados: {},

    init() {
        
    }
};

// Función global para realizar búsqueda
async function realizarBusqueda() {
    const query = document.getElementById('campoBusqueda').value;
    const contenedor = document.getElementById('resultadosBusqueda');

    if (!query || query.length < 2) {
        contenedor.innerHTML = '<div class="empty-state"><p>Escribe al menos 2 caracteres para buscar</p></div>';
        return;
    }

    try {
        // Hacer petición a la API de búsqueda global
        const respuesta = await fetch(`http://localhost:8080/api/search/global?query=${encodeURIComponent(query)}`);
        const resultados = await respuesta.json();

        let html = '<h3 style="margin-bottom: 20px;">Resultados de la búsqueda</h3>';
        let tieneResultados = false;

        // Mostrar usuarios encontrados
        if (resultados.usuarios && resultados.usuarios.length > 0) {
            tieneResultados = true;
            html += '<h4 style="margin-top: 20px; margin-bottom: 15px;">Usuarios</h4>';
            html += '<div class="lista-items">';

            resultados.usuarios.forEach(usuario => {
                html += '<div class="item">';
                html += `<div class="item-title">${usuario.first_name} ${usuario.last_name}</div>`;
                html += `<div style="color: #6b7280;">Email: ${usuario.email}</div>`;
                html += `<div style="color: #6b7280; font-size: 0.9rem;">Rol: ${usuario.role}</div>`;
                html += '</div>';
            });

            html += '</div>';
        }

        // Mostrar productos encontrados
        if (resultados.productos && resultados.productos.length > 0) {
            tieneResultados = true;
            html += '<h4 style="margin-top: 20px; margin-bottom: 15px;">Productos</h4>';
            html += '<div class="lista-items">';

            resultados.productos.forEach(producto => {
                html += '<div class="item">';
                html += `<div class="item-title">${producto.name}</div>`;
                html += `<div style="color: #7c3aed; font-weight: bold;">$${parseFloat(producto.price).toLocaleString()}</div>`;
                html += `<div style="color: #6b7280;">${producto.description || 'Sin descripción'}</div>`;
                html += '</div>';
            });

            html += '</div>';
        }

        // Mostrar contenido encontrado
        if (resultados.contenido && resultados.contenido.length > 0) {
            tieneResultados = true;
            html += '<h4 style="margin-top: 20px; margin-bottom: 15px;">Contenido</h4>';
            html += '<div class="lista-items">';

            resultados.contenido.forEach(contenido => {
                html += '<div class="item">';
                html += `<div class="item-title">${contenido.title}</div>`;
                html += `<div style="color: #6b7280;">Tipo: ${contenido.content_type}</div>`;
                html += `<div style="color: #6b7280; font-size: 0.9rem;">${contenido.description || 'Sin descripción'}</div>`;
                html += '</div>';
            });

            html += '</div>';
        }

        // Si no hay resultados
        if (!tieneResultados) {
            html = '<div class="empty-state"><p>No se encontraron resultados para "' + query + '"</p></div>';
        }

        contenedor.innerHTML = html;
    } catch (error) {
        contenedor.innerHTML = '<div class="empty-state"><p>Error al realizar la búsqueda</p></div>';
        console.error('Error:', error);
    }
}
