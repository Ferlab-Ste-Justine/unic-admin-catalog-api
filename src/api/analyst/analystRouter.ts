import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import verifyToken from '@/common/middleware/verifyToken';
import { validateRequest } from '@/common/utils/httpHandlers';

import {
  AnalystSchema,
  CreateAnalystSchema,
  DeleteAnalystSchema,
  GetAnalystSchema,
  GetAnalystsSchema,
  UpdateAnalystSchema,
} from './analystModel';
import { analystService } from './analystService';

export const analystRegistry = new OpenAPIRegistry();

analystRegistry.register('Analyst', AnalystSchema);

export const analystRouter: Router = (() => {
  const router = express.Router();

  // Get all analysts
  analystRegistry.registerPath({
    method: 'get',
    path: '/analysts',
    tags: ['Analyst'],
    request: {
      query: GetAnalystsSchema.shape.query,
    },
    responses: createApiResponse(z.array(AnalystSchema), 'Success'),
  });
  router.get('/', verifyToken, validateRequest(GetAnalystsSchema), async (req: Request, res: Response) => {
    const search = req.query.name as string | undefined;
    try {
      const analysts = await analystService.findAll(search);
      res.json(analysts);
    } catch (error) {
      res.status(500).send('Error fetching analysts');
    }
  });

  // Get analyst by ID
  analystRegistry.registerPath({
    method: 'get',
    path: '/analysts/{id}',
    tags: ['Analyst'],
    request: {
      params: GetAnalystSchema.shape.params,
    },
    responses: createApiResponse(AnalystSchema, 'Success'),
  });
  router.get('/:id', verifyToken, validateRequest(GetAnalystSchema), async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
      const analyst = await analystService.findById(id);
      if (analyst) {
        res.json(analyst);
      } else {
        res.status(404).send('Analyst not found');
      }
    } catch (error) {
      res.status(500).send('Error fetching analyst');
    }
  });

  // Create a new analyst
  analystRegistry.registerPath({
    method: 'post',
    path: '/analysts',
    tags: ['Analyst'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateAnalystSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(AnalystSchema, 'Success'),
  });
  router.post('/', verifyToken, validateRequest(CreateAnalystSchema), async (req: Request, res: Response) => {
    const { name } = req.body;
    try {
      const newAnalyst = await analystService.create({ name });
      res.status(201).json(newAnalyst);
    } catch (error) {
      res.status(500).send('Error creating analyst');
    }
  });

  // Update analyst
  analystRegistry.registerPath({
    method: 'put',
    path: '/analysts/{id}',
    tags: ['Analyst'],
    request: {
      params: UpdateAnalystSchema.shape.params,
      body: {
        content: {
          'application/json': {
            schema: UpdateAnalystSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(AnalystSchema, 'Success'),
  });
  router.put('/:id', verifyToken, validateRequest(UpdateAnalystSchema), async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const { name } = req.body;
    try {
      const updatedAnalyst = await analystService.update(id, { name });
      if (updatedAnalyst) {
        res.json(updatedAnalyst);
      } else {
        res.status(404).send('Analyst not found');
      }
    } catch (error) {
      res.status(500).send('Error updating analyst');
    }
  });

  // Delete analyst
  analystRegistry.registerPath({
    method: 'delete',
    path: '/analysts/{id}',
    tags: ['Analyst'],
    request: {
      params: DeleteAnalystSchema.shape.params,
    },
    responses: createApiResponse(AnalystSchema, 'Success'),
  });
  router.delete('/:id', verifyToken, validateRequest(DeleteAnalystSchema), async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
      await analystService.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).send('Error deleting analyst');
    }
  });

  return router;
})();
