import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import verifyToken from '@/common/middleware/verifyToken';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

import { GetUserSchema, LoginUserSchema, PublicUserSchema, RegisterUserSchema, UserSchema } from './userModel';
import { userService } from './userService';

export const userRegistry = new OpenAPIRegistry();
userRegistry.register('User', UserSchema);

export const userRouter: Router = (() => {
  const router = express.Router();

  userRegistry.registerPath({
    method: 'get',
    path: '/users',
    tags: ['User'],
    responses: createApiResponse(z.array(PublicUserSchema), 'Success'),
  });
  router.get('/', verifyToken, getAllUsers);

  userRegistry.registerPath({
    method: 'get',
    path: '/users/{id}',
    tags: ['User'],
    request: { params: GetUserSchema.shape.params },
    responses: createApiResponse(PublicUserSchema, 'Success'),
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
    responses: createApiResponse(PublicUserSchema, 'Success'),
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
    responses: createApiResponse(z.null(), 'Success'),
  });
  router.post('/login', validateRequest(LoginUserSchema), loginUser);

  userRegistry.registerPath({
    method: 'post',
    path: '/users/refresh',
    tags: ['User'],
    responses: createApiResponse(z.null(), 'Success'),
  });
  router.post('/refresh', refreshToken);

  userRegistry.registerPath({
    method: 'post',
    path: '/users/logout',
    tags: ['User'],
    responses: createApiResponse(z.null(), 'Success'),
  });
  router.post('/logout', logoutUser);

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

  if (loginResponse.success && loginResponse.responseObject) {
    res.cookie('accessToken', loginResponse.responseObject.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });
    res.cookie('refreshToken', loginResponse.responseObject.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });

    return handleServiceResponse(
      {
        ...loginResponse,
        responseObject: null,
      },
      res
    );
  }

  handleServiceResponse(loginResponse, res);
}

async function refreshToken(req: Request, res: Response) {
  const refreshToken = req.cookies['refreshToken'];

  if (!refreshToken) {
    return handleServiceResponse(
      new ServiceResponse(ResponseStatus.Failed, 'Invalid refresh token', null, StatusCodes.UNAUTHORIZED),
      res
    );
  }

  const refreshResponse = await userService.refresh(refreshToken);

  if (refreshResponse.success && refreshResponse.responseObject) {
    res.cookie('accessToken', refreshResponse.responseObject.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
    });
    res.cookie('refreshToken', refreshResponse.responseObject.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
    });

    return handleServiceResponse(
      {
        ...refreshResponse,
        responseObject: null,
      },
      res
    );
  }

  handleServiceResponse(refreshResponse, res);
}

async function logoutUser(req: Request, res: Response) {
  const refreshToken = req.cookies['refreshToken'];

  if (!refreshToken) {
    return handleServiceResponse(
      new ServiceResponse(ResponseStatus.Failed, 'Invalid refresh token', null, StatusCodes.UNAUTHORIZED),
      res
    );
  }

  const logoutResponse = await userService.logout(refreshToken);

  if (logoutResponse.success) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });
  }

  handleServiceResponse(logoutResponse, res);
}
