import { Router } from 'express';
import multer from 'multer';

import OrphanagesController from './controllers/OrphanagesController';
import UsersController from './controllers/UsersController';
import AuthController from './controllers/AuthController';

import uploadConfig from './config/upload';

const routes = Router();
const upload = multer(uploadConfig);

routes.post('/signup', UsersController.create);
routes.post('/signin', AuthController.signin);

routes.get('/orphanages', OrphanagesController.index);
routes.get('/orphanages/:id', OrphanagesController.show);
routes.post('/orphanages', upload.array('images'), OrphanagesController.create);

routes.post('/forgot-password', AuthController.forgotPassword);
routes.put('/change-password', AuthController.changePassword);

routes.put('/confirm-email', AuthController.confirmEmail);

routes.post('/validate-token', AuthController.validateToken);

export default routes;
