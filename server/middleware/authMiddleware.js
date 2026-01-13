import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  console.log('🔐 [AUTH-MIDDLEWARE] Verificando token...');

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('⚠️ [AUTH-MIDDLEWARE] No se proporcionó token');
    return res.status(401).json({
      message: 'Acceso denegado. Token no proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('✅ [AUTH-MIDDLEWARE] Token válido para usuario:', decoded.usuario);

    req.user = {
      id: decoded.id,
      usuario: decoded.usuario,
      rol: decoded.rol,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('❌ [AUTH-MIDDLEWARE] Token inválido:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expirado. Por favor inicie sesión nuevamente'
      });
    }

    return res.status(403).json({
      message: 'Token inválido'
    });
  }
};
