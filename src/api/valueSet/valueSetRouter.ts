import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import verifyToken from '@/common/middleware/verifyToken';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

import {
  CreateValueSetSchema,
  DeleteValueSetSchema,
  GetValueSetSchema,
  GetValueSetsSchema,
  UpdateValueSetSchema,
  ValueSetSchema,
} from './valueSetModel';
import { valueSetService } from './valueSetService';

export const valueSetRegistry = new OpenAPIRegistry();
valueSetRegistry.register('ValueSet', ValueSetSchema);

export const valueSetRouter: Router = (() => {
  const router = express.Router();

  router.use(verifyToken);

  valueSetRegistry.registerPath({
    method: 'get',
    path: '/valueSets',
    tags: ['Value Set'],
    request: {
      query: GetValueSetsSchema.shape.query,
    },
    responses: createApiResponse(z.array(ValueSetSchema), 'Success'),
  });
  router.get('/', validateRequest(GetValueSetsSchema), getAllValueSets);

  valueSetRegistry.registerPath({
    method: 'get',
    path: '/valueSets/{id}',
    tags: ['Value Set'],
    request: {
      params: GetValueSetSchema.shape.params,
    },
    responses: createApiResponse(ValueSetSchema, 'Success'),
  });
  router.get('/:id', validateRequest(GetValueSetSchema), getValueSetById);

  valueSetRegistry.registerPath({
    method: 'post',
    path: '/valueSets',
    tags: ['Value Set'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateValueSetSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(ValueSetSchema, 'Success'),
  });
  router.post('/', validateRequest(CreateValueSetSchema), createNewValueSet);

  valueSetRegistry.registerPath({
    method: 'put',
    path: '/valueSets/{id}',
    tags: ['Value Set'],
    request: {
      params: UpdateValueSetSchema.shape.params,
      body: {
        content: {
          'application/json': {
            schema: UpdateValueSetSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(ValueSetSchema, 'Success'),
  });
  router.put('/:id', validateRequest(UpdateValueSetSchema), updateValueSetById);

  valueSetRegistry.registerPath({
    method: 'delete',
    path: '/valueSets/{id}',
    tags: ['Value Set'],
    request: {
      params: DeleteValueSetSchema.shape.params,
    },
    responses: createApiResponse(ValueSetSchema, 'Success'),
  });
  router.delete('/:id', validateRequest(DeleteValueSetSchema), deleteValueSetById);

  return router;
})();

async function getAllValueSets(req: Request, res: Response) {
  const valueSets = await valueSetService.findAll();
  handleServiceResponse(valueSets, res);
}

async function getValueSetById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const valueSet = await valueSetService.findById(id);
  handleServiceResponse(valueSet, res);
}

async function createNewValueSet(req: Request, res: Response) {
  const newValueSet = await valueSetService.create(req.body);
  handleServiceResponse(newValueSet, res);
}

async function updateValueSetById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const updatedValueSet = await valueSetService.update(id, req.body);
  handleServiceResponse(updatedValueSet, res);
}

async function deleteValueSetById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const deleteResponse = await valueSetService.delete(id);
  handleServiceResponse(deleteResponse, res);
}
