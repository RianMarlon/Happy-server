import { Router } from 'express';
import multer from 'multer';

import OrphanagesController from './controllers/OrphanagesController';
import UsersController from './controllers/UsersController';
import AuthController from './controllers/AuthController';
import authenticate from './middlewares/auth';

import uploadConfig from './config/upload';

const routes = Router();
const upload = multer(uploadConfig);

routes.post('/signup', UsersController.create);
routes.post('/signin', AuthController.signin);
routes.put('/confirm-email', AuthController.confirmEmail);

routes.post('/forgot-password', AuthController.forgotPassword);
routes.put('/change-password', AuthController.changePassword);
routes.post('/validate-token', AuthController.validateToken);

routes.get('/orphanages', authenticate, OrphanagesController.index);
routes.post('/orphanages', authenticate, upload.array('images'), OrphanagesController.create);
routes.get('/orphanages/:id', authenticate, OrphanagesController.show);

routes.put('/orphanages/:id', upload.array('images'), OrphanagesController.update);
routes.delete('/orphanages/:id', OrphanagesController.destroy);

routes.get('/orphanages-confirmed', OrphanagesController.indexConfirmed);
routes.get('/orphanages-pending', OrphanagesController.indexPending);

routes.put('/orphanages/:id/confirm', OrphanagesController.confirm);

export default routes;
