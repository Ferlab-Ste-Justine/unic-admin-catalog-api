import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

import { GetUserSchema, loginSchema, registerSchema, UserSchema } from './userModel';
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
    const serviceResponse = await userService.findAll();
    handleServiceResponse(serviceResponse, res);
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
    const id = parseInt(req.params.id as string, 10);
    const serviceResponse = await userService.findById(id);
    handleServiceResponse(serviceResponse, res);
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
    // const {name, email, password} = req.body;
    try {
      // const user = new User({name, email, password});
      // await user.save();
      res.status(201).send('User registered successfully');
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
    // const {email, password} = req.body;
    try {
      // const user = await User.findOne({email});
      // if (!user || !(await user.comparePassword(password))) {
      //     return res.status(400).send('Invalid credentials');
      // }
      // const token = jwt.sign({userId: user._id}, 'your_jwt_secret', {expiresIn: '1h'});
      // res.json({token});
    } catch (error) {
      res.status(500).send('Error logging in');
    }
  });

  return router;
})();
