import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

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