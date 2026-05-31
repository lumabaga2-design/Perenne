const notificacionesModulo = {
    notificaciones: [],
    usuarioActualId: 1, // esto sería el usuario autenticado

    init() {
        this.cargarNotificaciones();
        // Cargar notificaciones cada 30 segundos
        setInterval(() => this.cargarNotificaciones(), 30000);
    },

    // Cargar notificaciones del usuario
    async cargarNotificaciones() {
        try {
            const respuesta = await fetch(`http://localhost:3000/api/notifications/user/${this.usuarioActualId}`);
            const notificaciones = await respuesta.json();
            this.notificaciones = notificaciones;
            this.renderizarNotificaciones();
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        }
    },

    // Mostrar notificaciones
    renderizarNotificaciones() {
        const contenedor = document.getElementById('notificacionesLista');

        if (this.notificaciones.length === 0) {
            contenedor.innerHTML = '<div class="empty-state"><p>No hay notificaciones</p></div>';
            return;
        }

        // Iconos para cada tipo de notificación
        const iconos = {
            like: '❤️',
            comment: '💬',
            reply: '↩️',
            shipment_update: '📦',
            new_content: '📁',
            new_product: '🛍️'
        };

        // Colores para cada tipo
        const colores = {
            like: '#ef4444',
            comment: '#7c3aed',
            reply: '#7c3aed',
            shipment_update: '#f59e0b',
            new_content: '#10b981',
            new_product: '#10b981'
        };

        let html = '<div class="lista-items">';

        this.notificaciones.forEach(notif => {
            html += '<div class="item">';
            
            // Icono y tipo
            html += `<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">`;
            html += `<span style="font-size: 1.5rem;">${iconos[notif.type] || '📢'}</span>`;
            html += `<span style="background: ${colores[notif.type]}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">${notif.type.toUpperCase()}</span>`;
            html += `${notif.is_read ? '<span style="color: #6b7280;">(Leído)</span>' : '<span style="color: #ef4444; font-weight: bold;">(Nuevo)</span>'}`;
            html += '</div>';
            
            // Mensaje
            html += `<div class="item-title">${notif.message}</div>`;
            
            // Botón para marcar como leído
            if (!notif.is_read) {
                html += `<button class="btn-small" style="background: #7c3aed; margin-top: 10px;" onclick="notificacionesModulo.marcarLeidda(${notif.notification_id})">Marcar como leído</button>`;
            }
            
            html += '</div>';
        });

        html += '</div>';
        contenedor.innerHTML = html;
    },

    // Marcar notificación como leída
    async marcarLeidda(notificationId) {
        try {
            const respuesta = await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, {
                method: 'PUT'
            });

            if (respuesta.ok) {
                this.cargarNotificaciones();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
};
