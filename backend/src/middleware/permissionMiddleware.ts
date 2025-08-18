import { Request, Response, NextFunction } from 'express';
import Role from '../models/Role';
import { Schema } from 'mongoose';

interface AuthenticatedRequest extends Request {
    user?: {
        _id: Schema.Types.ObjectId;
        name: string;
        email: string;
        role: Schema.Types.ObjectId;
    };
}

const permissionMiddleware = (requiredPermission: string) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userRole = req.user?.role;

            if (!userRole) {
                return res.status(401).json({ message: 'No autenticado o rol no encontrado.' });
            }

            const role = await Role.findById(userRole);

            if (!role) {
                return res.status(403).json({ message: 'Rol de usuario no válido.' });
            }

            //dar acceso total al rol 'admin'
            // Si el rol del usuario es 'admin', se le concede el acceso sin verificar permisos
            if (role.name === 'admin') {
                return next();
            }

            // Si no es 'admin', se verifica si tiene el permiso requerido
            if (role.permissions.includes(requiredPermission)) {
                next();
            } else {
                res.status(403).json({ message: 'No tienes los permisos necesarios para realizar esta acción.' });
            }
        } catch (error) {
            console.error('Error en el middleware de permisos:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    };
};

export default permissionMiddleware;