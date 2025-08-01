import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { Types } from 'mongoose'; // Importar Types para el tipado de _id

// --- Declaración Global de Express ---
// Esto es CRUCIAL para que TypeScript sepa que 'req.user' puede existir y qué tipo tiene.
// Si ya tienes esta declaración en un archivo .d.ts o en otro middleware, no la dupliques.
declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Define que 'user' puede existir y ser de tipo IUser
    }
  }
}

/**
 * @desc    Middleware para proteger rutas (requiere token JWT)
 * @param   req - Objeto de solicitud de Express
 * @param   res - Objeto de respuesta de Express
 * @param   next - Función para pasar al siguiente middleware/controlador
 */
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // Verifica si hay un token en los encabezados de autorización (formato 'Bearer TOKEN')
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extrae el token (la parte después de 'Bearer ')
      token = req.headers.authorization.split(' ')[1];

      // Verifica y decodifica el token JWT
      // Asume que JWT_SECRET es una cadena y que el token contiene un 'id'
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string | Types.ObjectId };

      // Busca al usuario en la base de datos por el ID del token
      // .select('-password') excluye la contraseña por seguridad
      // Casteamos el resultado a IUser para asegurar el tipado de req.user
      req.user = await User.findById(decoded.id).select('-password') as IUser;

      // Si el usuario no se encuentra (ej. token válido pero usuario eliminado)
      if (!req.user) {
        res.status(401).json({ message: 'No autorizado, token fallido: usuario no encontrado.' });
        return;
      }

      next(); // Si todo es correcto, pasa al siguiente middleware/controlador
    } catch (error: any) {
      console.error('Error de autenticación:', error.message);
      res.status(401).json({ message: 'No autorizado, token fallido: ' + error.message });
      return;
    }
  }

  // Si no se proporcionó ningún token
  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token.' });
  }
};

/**
 * @desc    Middleware para autorizar roles específicos
 * @param   roles - Un array de strings con los roles permitidos (ej. 'admin', 'editor')
 * @returns Un middleware que verifica el rol del usuario
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Si req.user no existe (porque 'protect' no se ejecutó o falló), o si no tiene rol
    if (!req.user || !req.user.role) {
      res.status(403).json({ message: 'Acceso denegado: No se pudo verificar el rol del usuario.' });
      return;
    }

    // Verifica si el rol del usuario actual está incluido en los roles permitidos
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: `Acceso denegado: Rol (${req.user.role}) no autorizado para esta acción.` });
      return;
    }
    next(); // Si el rol está autorizado, pasa al siguiente middleware/controlador
  };
};