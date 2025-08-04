import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Definimos una interfaz para el request de Express, añadiendo el campo 'user'
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;

  // Verificamos si la petición contiene un token de autorización en el header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtenemos el token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificamos el token con nuestra clave secreta
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      // Buscamos el usuario por el ID que está en el token
      // Seleccionamos todos los campos excepto el password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401).json({ message: 'Token no válido, usuario no encontrado.' });
        return;
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'No autorizado, el token ha fallado.' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token.' });
    return;
  }
};