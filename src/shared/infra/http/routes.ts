import { Router, Request, Response } from 'express';
import multer from 'multer';

import isAuthenticated from './middlewares/is-authenticated';
import isAdmin from './middlewares/is-admin';

import FindAllOrphanagesController from '../../../modules/orphanages/infra/http/controllers/find-all-orphanages-controller';
import FindAllOrphanagesConfirmedController from '../../../modules/orphanages/infra/http/controllers/find-all-orphanages-confirmed-controller';
import FindAllOrphanagesPendingController from '../../../modules/orphanages/infra/http/controllers/find-all-orphanages-pending-controller';
import ShowOrphanageController from '../../../modules/orphanages/infra/http/controllers/show-orphanage-controller';
import CreateOrphanageController from '../../../modules/orphanages/infra/http/controllers/create-orphanage-controller';
import UpdateOrphanageController from '../../../modules/orphanages/infra/http/controllers/update-orphanage-controller';
import DeleteOrphanageController from '../../../modules/orphanages/infra/http/controllers/delete-orphanage-controller';
import ConfirmOrphanageController from '../../../modules/orphanages/infra/http/controllers/confirm-orphanage-controller';

import CreateUserController from '../../../modules/users/infra/http/controllers/create-user-controller';

import SigninController from '../../../modules/auth/infra/http/controllers/signin-controller';
import ConfirmEmailController from '../../../modules/auth/infra/http/controllers/confirm-email-controller';
import ForgotPasswordController from '../../../modules/auth/infra/http/controllers/forgot-password-controller';
import ChangePasswordController from '../../../modules/auth/infra/http/controllers/change-password-controller';
import ValidateTokenController from '../../../modules/auth/infra/http/controllers/validate-token-controller';

import uploadConfig from '../../../config/upload';
import { FindImageByFilenameController } from '../../../modules/images/infra/http/find-image-by-filename-controller';

const routes = Router();
const upload = multer(uploadConfig.multer);

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

const findImageByFilenameController = new FindImageByFilenameController();

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
  isAuthenticated,
  findAllOrphanagesController.handleRequest
);
routes.post(
  '/orphanages',
  isAuthenticated,
  upload.array('images'),
  createOrphanageController.handleRequest
);
routes.get(
  '/images/orphanages/:filename',
  findImageByFilenameController.handleRequest
);
routes.get(
  '/orphanages/:id',
  isAuthenticated,
  showOrphanageController.handleRequest
);

routes.put(
  '/orphanages/:id',
  isAdmin,
  upload.array('images'),
  updateOrphanageController.handleRequest
);
routes.delete(
  '/orphanages/:id',
  isAdmin,
  deleteOrphanageController.handleRequest
);

routes.get(
  '/orphanages-confirmed',
  isAdmin,
  findAllOrphanagesConfirmedController.handleRequest
);
routes.get(
  '/orphanages-pending',
  isAdmin,
  findAllOrphanagesPendingController.handleRequest
);

routes.put(
  '/orphanages/:id/confirm',
  isAdmin,
  confirmOrphanageController.handleRequest
);

routes.get('/status', (request: Request, response: Response) => {
  return response.status(200).json();
});

export default routes;
