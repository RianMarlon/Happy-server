import { Router, Request, Response } from 'express';
import multer from 'multer';

import authenticate from './middlewares/auth';
import authenticateAdmin from './middlewares/authAdmin';

import FindAllOrphanagesController from './modules/orphanages/infra/http/controllers/find-all-orphanages-controller';
import FindAllOrphanagesConfirmedController from './modules/orphanages/infra/http/controllers/find-all-orphanages-confirmed-controller';
import FindAllOrphanagesPendingController from './modules/orphanages/infra/http/controllers/find-all-orphanages-pending-controller';
import ShowOrphanageController from './modules/orphanages/infra/http/controllers/show-orphanage-controller';
import CreateOrphanageController from './modules/orphanages/infra/http/controllers/create-orphanage-controller';
import UpdateOrphanageController from './modules/orphanages/infra/http/controllers/update-orphanage-controller';
import DeleteOrphanageController from './modules/orphanages/infra/http/controllers/delete-orphanage-controller';
import ConfirmOrphanageController from './modules/orphanages/infra/http/controllers/confirm-orphanage-controller';

import CreateUserController from './modules/users/infra/http/controllers/create-user-controller';

import SigninController from './modules/auth/infra/http/controllers/signin-controller';
import ConfirmEmailController from './modules/auth/infra/http/controllers/confirm-email-controller';
import ForgotPasswordController from './modules/auth/infra/http/controllers/forgot-password-controller';
import ChangePasswordController from './modules/auth/infra/http/controllers/change-password-controller';
import ValidateTokenController from './modules/auth/infra/http/controllers/validate-token-controller';

import uploadConfig from './config/upload';

const routes = Router();
const upload = multer(uploadConfig);

const findAllOrphanagesController = new FindAllOrphanagesController();
const findAllOrphanagesConfirmedController =
  new FindAllOrphanagesConfirmedController();
const findAllOrphanagesPendingController =
  new FindAllOrphanagesPendingController();
const showOrphanageController = new ShowOrphanageController();
const createOrphanageController = new CreateOrphanageController();
const updateOrphanageController = new UpdateOrphanageController();
const confirmOrphanageController = new ConfirmOrphanageController();
const deleteOrphanageController = new DeleteOrphanageController();

const createUserController = new CreateUserController();

const signinController = new SigninController();
const confirmEmailController = new ConfirmEmailController();
const forgotPasswordController = new ForgotPasswordController();
const changePasswordController = new ChangePasswordController();
const validateTokenController = new ValidateTokenController();

routes.post('/signup', createUserController.handleRequest);
routes.post('/signin', signinController.handleRequest);
routes.put('/confirm-email', confirmEmailController.handleRequest);

routes.post('/forgot-password', forgotPasswordController.handleRequest);
routes.put('/change-password', changePasswordController.handleRequest);
routes.post('/validate-token', validateTokenController.handleRequest);

routes.get(
  '/orphanages',
  authenticate,
  findAllOrphanagesController.handleRequest
);
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
  findAllOrphanagesConfirmedController.handleRequest
);
routes.get(
  '/orphanages-pending',
  authenticateAdmin,
  findAllOrphanagesPendingController.handleRequest
);

routes.put(
  '/orphanages/:id/confirm',
  authenticateAdmin,
  confirmOrphanageController.handleRequest
);

routes.get('/status', (request: Request, response: Response) => {
  return response.status(200).json();
});

export default routes;
