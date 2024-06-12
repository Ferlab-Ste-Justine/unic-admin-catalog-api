import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import verifyToken from '@/common/middleware/verifyToken';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

import {
  CreateVariableSchema,
  GetVariableSchema,
  GetVariablesSchema,
  UpdateVariableSchema,
  VariableSchema,
} from './variableModel';
import { variableService } from './variableService';

export const variableRegistry = new OpenAPIRegistry();
variableRegistry.register('Variable', VariableSchema);

export const variableRouter: Router = (() => {
  const router = express.Router();

  router.use(verifyToken);

  variableRegistry.registerPath({
    method: 'get',
    path: '/variables',
    tags: ['Variable'],
    request: {
      query: GetVariablesSchema.shape.query,
    },
    responses: createApiResponse(z.array(VariableSchema), 'Success'),
  });
  router.get('/', validateRequest(GetVariablesSchema), getAllVariables);

  variableRegistry.registerPath({
    method: 'get',
    path: '/variables/:id',
    tags: ['Variable'],
    request: {
      params: GetVariableSchema.shape.params,
    },
    responses: createApiResponse(VariableSchema, 'Success'),
  });
  router.get('/:id', validateRequest(GetVariableSchema), getVariableById);

  variableRegistry.registerPath({
    method: 'post',
    path: '/variables',
    tags: ['Variable'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateVariableSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(VariableSchema, 'Success'),
  });
  router.post('/', validateRequest(CreateVariableSchema), createNewVariable);

  variableRegistry.registerPath({
    method: 'put',
    path: '/variables/:id',
    tags: ['Variable'],
    request: {
      params: UpdateVariableSchema.shape.params,
      body: {
        content: {
          'application/json': {
            schema: UpdateVariableSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(VariableSchema, 'Success'),
  });
  router.put('/:id', validateRequest(UpdateVariableSchema), updateVariableById);

  variableRegistry.registerPath({
    method: 'delete',
    path: '/variables/:id',
    tags: ['Variable'],
    request: {
      params: GetVariableSchema.shape.params,
    },
    responses: createApiResponse(VariableSchema, 'Success'),
  });
  router.delete('/:id', validateRequest(GetVariableSchema), deleteVariableById);

  return router;
})();

async function getAllVariables(req: Request, res: Response) {
  const search = req.query.name as string | undefined;
  const variables = await variableService.findAll(search);
  handleServiceResponse(variables, res);
}

async function getVariableById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const variable = await variableService.findById(id);
  handleServiceResponse(variable, res);
}

async function createNewVariable(req: Request, res: Response) {
  const newVariable = await variableService.create(req.body);
  handleServiceResponse(newVariable, res);
}

async function updateVariableById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const updatedVariable = await variableService.update(id, req.body);
  handleServiceResponse(updatedVariable, res);
}

async function deleteVariableById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const deleteResponse = await variableService.delete(id);
  handleServiceResponse(deleteResponse, res);
}
