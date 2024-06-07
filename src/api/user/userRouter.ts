import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import bcrypt from 'bcrypt';
import express, { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { validateRequest } from '@/common/utils/httpHandlers';

import { GetUserSchema, LoginUserSchema, RegisterUserSchema, UserSchema } from './userModel';
import { userService } from './userService';

export const userRegistry = new OpenAPIRegistry();

userRegistry.register('User', UserSchema);

export const userRouter: Router = (() => {
  const router = express.Router();

  // Get all users
  userRegistry.registerPath({
    method: 'get',
    path: '/users',
    tags: ['User'],
    responses: createApiResponse(z.array(UserSchema), 'Success'),
  });
  router.get('/', async (_req: Request, res: Response) => {
    const users = await userService.findAll();
    res.json(users);
  });

  // Get user by ID
  userRegistry.registerPath({
    method: 'get',
    path: '/users/{id}',
    tags: ['User'],
    request: { params: GetUserSchema.shape.params },
    responses: createApiResponse(UserSchema, 'Success'),
  });
  router.get('/:id', validateRequest(GetUserSchema), async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const user = await userService.findById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).send('User not found');
    }
  });

  // Register a new user
  userRegistry.registerPath({
    method: 'post',
    path: '/users/register',
    tags: ['User'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: RegisterUserSchema,
          },
        },
      },
    },
    responses: createApiResponse(UserSchema, 'Success'),
  });
  router.post('/register', validateRequest(RegisterUserSchema), async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
      const user = await userService.register({ name, email, password });
      res.status(201).json(user);
    } catch (error) {
      res.status(400).send('Error registering user');
    }
  });

  // Login a user
  userRegistry.registerPath({
    method: 'post',
    path: '/users/login',
    tags: ['User'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: LoginUserSchema,
          },
        },
      },
    },
    responses: createApiResponse(z.object({ token: z.string() }), 'Success'),
  });
  router.post('/login', validateRequest(LoginUserSchema), async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const repsonse = await userService.findByEmail(email);
      if (!repsonse.responseObject || !(await bcrypt.compare(password, repsonse.responseObject.password))) {
        return res.status(400).send('Invalid credentials');
      }
      const token = jwt.sign({ userId: repsonse.responseObject.id }, 'your_jwt_secret', { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      res.status(500).send('Error logging in');
    }
  });

  return router;
})();
