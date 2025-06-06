import { User } from '../../components/auth/user.interface';

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}