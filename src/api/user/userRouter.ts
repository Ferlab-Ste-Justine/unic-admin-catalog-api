import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import bcrypt from 'bcrypt';
import express, { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { validateRequest } from '@/common/utils/httpHandlers';

import { GetUserSchema, loginSchema, registerSchema, UserSchema } from './userModel';
import { createUser, findAllUsers, findUserByEmail, findUserById } from './userRepository';

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
    const users = await findAllUsers();
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
    const user = await findUserById(id);
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
            schema: registerSchema,
          },
        },
      },
    },
    responses: createApiResponse(UserSchema, 'Success'),
  });
  router.post('/register', validateRequest(registerSchema), async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
      const user = await createUser({ name, email, password });
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
            schema: loginSchema,
          },
        },
      },
    },
    responses: createApiResponse(z.object({ token: z.string() }), 'Success'),
  });
  router.post('/login', validateRequest(loginSchema), async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const user = await findUserByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send('Invalid credentials');
      }
      const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      res.status(500).send('Error logging in');
    }
  });

  return router;
})();
