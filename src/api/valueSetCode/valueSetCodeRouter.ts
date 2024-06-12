import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import verifyToken from '@/common/middleware/verifyToken';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

import {
  CreateValueSetCodeSchema,
  DeleteValueSetCodeSchema,
  GetValueSetCodeSchema,
  UpdateValueSetCodeSchema,
  ValueSetCodeSchema,
} from './valueSetCodeModel';
import { valueSetCodeService } from './valueSetCodeService';

export const valueSetCodeRegistry = new OpenAPIRegistry();
valueSetCodeRegistry.register('ValueSetCode', ValueSetCodeSchema);

export const valueSetCodeRouter: Router = (() => {
  const router = express.Router();

  router.use(verifyToken);

  valueSetCodeRegistry.registerPath({
    method: 'get',
    path: '/value-set-codes',
    tags: ['Value Set Code'],
    responses: createApiResponse(z.array(ValueSetCodeSchema), 'Success'),
  });
  router.get('/', getAllValueSetCodes);

  // Get a value set code by ID
  valueSetCodeRegistry.registerPath({
    method: 'get',
    path: '/value-set-codes/{id}',
    tags: ['Value Set Code'],
    request: {
      params: GetValueSetCodeSchema.shape.params,
    },
    responses: createApiResponse(ValueSetCodeSchema, 'Success'),
  });
  router.get('/:id', validateRequest(GetValueSetCodeSchema), getValueSetCodeById);

  // Create a new value set code
  valueSetCodeRegistry.registerPath({
    method: 'post',
    path: '/value-set-codes',
    tags: ['Value Set Code'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateValueSetCodeSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(ValueSetCodeSchema, 'Success'),
  });
  router.post('/', validateRequest(CreateValueSetCodeSchema), createNewValueSetCode);

  // Update a value set code by ID
  valueSetCodeRegistry.registerPath({
    method: 'put',
    path: '/value-set-codes/{id}',
    tags: ['Value Set Code'],
    request: {
      params: UpdateValueSetCodeSchema.shape.params,
      body: {
        content: {
          'application/json': {
            schema: UpdateValueSetCodeSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(ValueSetCodeSchema, 'Success'),
  });
  router.put('/:id', validateRequest(UpdateValueSetCodeSchema), updateValueSetCodeById);

  valueSetCodeRegistry.registerPath({
    method: 'delete',
    path: '/value-set-codes/{id}',
    tags: ['Value Set Code'],
    request: {
      params: DeleteValueSetCodeSchema.shape.params,
    },
    responses: createApiResponse(ValueSetCodeSchema, 'Success'),
  });
  router.delete('/:id', validateRequest(DeleteValueSetCodeSchema), deleteValueSetCodeById);

  return router;
})();

async function getAllValueSetCodes(req: Request, res: Response) {
  const value_set_id = req.query.value_set_id as string | undefined;
  const valueSetCodes = await valueSetCodeService.findAll(value_set_id);
  handleServiceResponse(valueSetCodes, res);
}

async function getValueSetCodeById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const valueSetCode = await valueSetCodeService.findById(id);
  handleServiceResponse(valueSetCode, res);
}

async function createNewValueSetCode(req: Request, res: Response) {
  const newValueSetCode = await valueSetCodeService.create(req.body);
  handleServiceResponse(newValueSetCode, res);
}

async function updateValueSetCodeById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const updatedValueSetCode = await valueSetCodeService.update(id, req.body);
  handleServiceResponse(updatedValueSetCode, res);
}

async function deleteValueSetCodeById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const deleteResponse = await valueSetCodeService.delete(id);
  handleServiceResponse(deleteResponse, res);
}
