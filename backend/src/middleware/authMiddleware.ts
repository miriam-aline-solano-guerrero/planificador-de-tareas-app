import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { Schema, Document } from 'mongoose';

// Interfaz define la forma del documento que Mongoose devuelve
interface UserDocument extends Document {
    _id: Schema.Types.ObjectId;
    role: Schema.Types.ObjectId;
}

interface AuthenticatedRequest extends Request {
    user?: {
        _id: Schema.Types.ObjectId;
        role: Schema.Types.ObjectId;
    };
}

//para proteger rutas segun el rol y los permisos
const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

            const userFromDb = await User.findById(decoded.id).select('_id role') as UserDocument;

            if (!userFromDb) {
                res.status(401);
                throw new Error('Usuario no encontrado');
            }

            req.user = {
                _id: userFromDb._id,
                role: userFromDb.role
            };

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'No autorizado, token fallido' });
        }
    } else {
        res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};

export { protect };