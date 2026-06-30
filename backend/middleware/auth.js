/**
 * MIDDLEWARE DE AUTENTICACIÓN
 * Verifica que el usuario esté autenticado
 * 
 * Este middleware se ejecuta ANTES de los controllers
 * para verificar que el usuario tiene permiso
 */
 
const jwt = require('jsonwebtoken');
 
/**
 * FUNCIÓN: verifyToken
 * ¿QUÉ HACE?: Verifica que el token JWT sea válido
 * 
 * FLUJO:
 * 1. Obtiene token del header "Authorization"
 * 2. Verifica que el token es válido
 * 3. Decodifica y obtiene datos del usuario
 * 4. Pasa los datos al siguiente middleware
 */
const verifyToken = (req, res, next) => {
  try {
    // Paso 1: Obtener el token del header
    // Formato esperado: "Bearer token_aqui"
    const authHeader = req.headers.authorization;
 
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: true,
        message: 'Token no proporcionado o formato inválido',
        code: 'NO_TOKEN'
      });
    }
 
    // Extraer el token (quitar "Bearer ")
    const token = authHeader.slice(7);
 
    // Paso 2: Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
    // Paso 3: Guardar datos del usuario en request
    // Así el controller puede acceder a req.user
    req.user = {
      user_id: decoded.user_id,
      email: decoded.email,
      role: decoded.role
    };
 
    // Paso 4: Pasar al siguiente middleware
    next();
 
  } catch (error) {
    // Errores posibles de JWT
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
 
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: true,
        message: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
 
    return res.status(500).json({
      error: true,
      message: 'Error verificando token'
    });
  }
};
 
/**
 * FUNCIÓN: verifyRole
 * ¿QUÉ HACE?: Verifica que el usuario tenga el rol requerido
 * 
 * PARÁMETRO: rol requerido (ej: 'admin', 'collaborator')
 */
const verifyRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'Usuario no autenticado'
      });
    }
 
    // Verificar que el rol del usuario incluye el requerido
    if (requiredRole && req.user.role !== requiredRole && req.user.role !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'No tienes permisos para realizar esta acción',
        code: 'INSUFFICIENT_ROLE'
      });
    }
 
    next();
  };
};
 
module.exports = { verifyToken, verifyRole };
 
 