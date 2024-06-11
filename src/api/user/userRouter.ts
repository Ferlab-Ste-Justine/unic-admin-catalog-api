import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import verifyToken from '@/common/middleware/verifyToken';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

import { GetUserSchema, LoginUserSchema, RegisterUserSchema, UserSchema } from './userModel';
import { userService } from './userService';

export const userRegistry = new OpenAPIRegistry();
userRegistry.register('User', UserSchema);

export const userRouter: Router = (() => {
  const router = express.Router();

  userRegistry.registerPath({
    method: 'get',
    path: '/users',
    tags: ['User'],
    responses: createApiResponse(z.array(UserSchema), 'Success'),
  });
  router.get('/', verifyToken, getAllUsers);

  userRegistry.registerPath({
    method: 'get',
    path: '/users/{id}',
    tags: ['User'],
    request: { params: GetUserSchema.shape.params },
    responses: createApiResponse(UserSchema, 'Success'),
  });
  router.get('/:id', verifyToken, validateRequest(GetUserSchema), getUserById);

  userRegistry.registerPath({
    method: 'post',
    path: '/users/register',
    tags: ['User'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: RegisterUserSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(UserSchema, 'Success'),
  });
  router.post('/register', validateRequest(RegisterUserSchema), registerUser);

  userRegistry.registerPath({
    method: 'post',
    path: '/users/login',
    tags: ['User'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: LoginUserSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(z.object({ token: z.string() }), 'Success'),
  });
  router.post('/login', validateRequest(LoginUserSchema), loginUser);

  return router;
})();

async function getAllUsers(req: Request, res: Response) {
  const users = await userService.findAll();
  handleServiceResponse(users, res);
}

async function getUserById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const user = await userService.findById(id);
  handleServiceResponse(user, res);
}

async function registerUser(req: Request, res: Response) {
  const user = await userService.register(req.body);
  handleServiceResponse(user, res);
}

async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;
  const loginResponse = await userService.login(email, password);
  handleServiceResponse(loginResponse, res);
}
