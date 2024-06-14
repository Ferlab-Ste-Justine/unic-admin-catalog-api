import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import verifyToken from '@/common/middleware/verifyToken';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';
import { SortOrder } from '@/types';

import {
  AnalystSchema,
  AnalystSearchFields,
  AnalystSortColumn,
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

  router.use(verifyToken);

  analystRegistry.registerPath({
    method: 'get',
    path: '/analysts',
    tags: ['Analyst'],
    request: {
      query: GetAnalystsSchema.shape.query,
    },
    responses: createApiResponse(z.array(AnalystSchema), 'Success'),
  });
  router.get('/', validateRequest(GetAnalystsSchema), getAllAnalysts);

  analystRegistry.registerPath({
    method: 'get',
    path: '/analysts/{id}',
    tags: ['Analyst'],
    request: {
      params: GetAnalystSchema.shape.params,
    },
    responses: createApiResponse(AnalystSchema, 'Success'),
  });
  router.get('/:id', validateRequest(GetAnalystSchema), getAnalystById);

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
  router.post('/', validateRequest(CreateAnalystSchema), createNewAnalyst);

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
  router.put('/:id', validateRequest(UpdateAnalystSchema), updateAnalystById);

  analystRegistry.registerPath({
    method: 'delete',
    path: '/analysts/{id}',
    tags: ['Analyst'],
    request: {
      params: DeleteAnalystSchema.shape.params,
    },
    responses: createApiResponse(AnalystSchema, 'Success'),
  });
  router.delete('/:id', validateRequest(DeleteAnalystSchema), deleteAnalystById);

  return router;
})();

async function getAllAnalysts(req: Request, res: Response) {
  const searchField = req.query.searchField as AnalystSearchFields | undefined;
  const searchValue = req.query.searchValue as string | undefined;
  const sortBy = req.query.sortBy as AnalystSortColumn | undefined;
  const sortOrder = (req.query.sortOrder as SortOrder) || 'asc';
  const analysts = await analystService.findAll(searchField, searchValue, sortBy, sortOrder);
  handleServiceResponse(analysts, res);
}

async function getAnalystById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const analyst = await analystService.findById(id);
  handleServiceResponse(analyst, res);
}

async function createNewAnalyst(req: Request, res: Response) {
  const newAnalyst = await analystService.create(req.body);
  handleServiceResponse(newAnalyst, res);
}

async function updateAnalystById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const updatedAnalyst = await analystService.update(id, req.body);
  handleServiceResponse(updatedAnalyst, res);
}

async function deleteAnalystById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const deleteResponse = await analystService.delete(id);
  handleServiceResponse(deleteResponse, res);
}
