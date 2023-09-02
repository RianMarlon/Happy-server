import { Router, Request, Response } from 'express';
import multer from 'multer';

import OrphanagesController from './controllers/OrphanagesController';
import UsersController from './controllers/UsersController';
import AuthController from './controllers/AuthController';
import authenticate from './middlewares/auth';
import authenticateAdmin from './middlewares/authAdmin';

import ShowOrphanageController from './modules/orphanages/infra/http/controllers/show-orphanage-controller';
import CreateOrphanageController from './modules/orphanages/infra/http/controllers/create-orphanage-controller';
import UpdateOrphanageController from './modules/orphanages/infra/http/controllers/update-orphanage-controller';
import DeleteOrphanageController from './modules/orphanages/infra/http/controllers/delete-orphanage-controller';

import uploadConfig from './config/upload';

const routes = Router();
const upload = multer(uploadConfig);
const createOrphanageController = new CreateOrphanageController();
const updateOrphanageController = new UpdateOrphanageController();
const deleteOrphanageController = new DeleteOrphanageController();
const showOrphanageController = new ShowOrphanageController();

routes.post('/signup', UsersController.create);
routes.post('/signin', AuthController.signin);
routes.put('/confirm-email', AuthController.confirmEmail);

routes.post('/forgot-password', AuthController.forgotPassword);
routes.put('/change-password', AuthController.changePassword);
routes.post('/validate-token', AuthController.validateToken);

routes.get('/orphanages', authenticate, OrphanagesController.index);
routes.post(
  '/orphanages',
  authenticate,
  upload.array('images'),
  createOrphanageController.handleRequest
);
routes.get(
  '/orphanages/:id',
  authenticate,
  showOrphanageController.handleRequest
);

routes.put(
  '/orphanages/:id',
  authenticateAdmin,
  upload.array('images'),
  updateOrphanageController.handleRequest
);
routes.delete(
  '/orphanages/:id',
  authenticateAdmin,
  deleteOrphanageController.handleRequest
);

routes.get(
  '/orphanages-confirmed',
  authenticateAdmin,
  OrphanagesController.indexConfirmed
);
routes.get(
  '/orphanages-pending',
  authenticateAdmin,
  OrphanagesController.indexPending
);

routes.put(
  '/orphanages/:id/confirm',
  authenticateAdmin,
  OrphanagesController.confirm
);

routes.get('/status', (request: Request, response: Response) => {
  return response.status(200).json();
});

export default routes;
