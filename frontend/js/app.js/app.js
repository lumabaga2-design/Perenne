// Cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar todos los módulos
    usuariosModulo.init();
    clientesModulo.init();
    productosModulo.init();
    contenidoModulo.init();
    feedModulo.init();
    carritoModulo.init();
    pagosModulo.init();
    enviosModulo.init();
    busquedaModulo.init();
    interaccionesModulo.init();
    notificacionesModulo.init();

    // Configurar navegación entre módulos
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const moduleName = btn.dataset.module;

            // remueve clase active de todos los botones
            document.querySelectorAll('.nav-btn').forEach(b => {
                b.classList.remove('active');
            });

            // remueve clase active de todos los módulos
            document.querySelectorAll('.module').forEach(m => {
                m.style.display = 'none';
            });

            // Agregar clase active al botón clickeado
            btn.classList.add('active');

            // Mostrar módulo correspondiente
            const moduleId = moduleName + '-module';
            const moduleElement = document.getElementById(moduleId);
            
            if (moduleElement) {
                moduleElement.style.display = 'block';
            }

            // Actualizar selectores si es necesario
            if (moduleName === 'pagos') {
                pagosModulo.actualizarSelectoUsuarios();
            }
            if (moduleName === 'envios') {
                enviosModulo.actualizarSelectoClientes();
            }
            if (moduleName === 'carrito') {
                productosModulo.actualizarSelectoCarrito();
            }
        });
    });
});


