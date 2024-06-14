import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import verifyToken from '@/common/middleware/verifyToken';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

import { CreateMappingSchema, GetMappingSchema, MappingSchema, UpdateMappingSchema } from './mappingModel';
import { mappingService } from './mappingService';

export const mappingRegistry = new OpenAPIRegistry();
mappingRegistry.register('Mapping', MappingSchema);

export const mappingRouter: Router = (() => {
  const router = express.Router();

  router.use(verifyToken);

  mappingRegistry.registerPath({
    method: 'get',
    path: '/mappings',
    tags: ['Mapping'],
    responses: createApiResponse(z.array(MappingSchema), 'Success'),
  });
  router.get('/', getAllMappings);

  mappingRegistry.registerPath({
    method: 'get',
    path: '/mappings/{id}',
    tags: ['Mapping'],
    request: {
      params: GetMappingSchema.shape.params,
    },
    responses: createApiResponse(MappingSchema, 'Success'),
  });
  router.get('/:id', validateRequest(GetMappingSchema), getMappingById);

  mappingRegistry.registerPath({
    method: 'post',
    path: '/mappings',
    tags: ['Mapping'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateMappingSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(MappingSchema, 'Success'),
  });
  router.post('/', validateRequest(CreateMappingSchema), createNewMapping);

  mappingRegistry.registerPath({
    method: 'put',
    path: '/mappings/{id}',
    tags: ['Mapping'],
    request: {
      params: UpdateMappingSchema.shape.params,
      body: {
        content: {
          'application/json': {
            schema: UpdateMappingSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(MappingSchema, 'Success'),
  });
  router.put('/:id', validateRequest(UpdateMappingSchema), updateMappingById);

  mappingRegistry.registerPath({
    method: 'delete',
    path: '/mappings/{id}',
    tags: ['Mapping'],
    request: {
      params: GetMappingSchema.shape.params,
    },
    responses: createApiResponse(MappingSchema, 'Success'),
  });
  router.delete('/:id', validateRequest(GetMappingSchema), deleteMappingById);

  return router;
})();

async function getAllMappings(req: Request, res: Response) {
  const mappings = await mappingService.findAll();
  handleServiceResponse(mappings, res);
}

async function getMappingById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const mapping = await mappingService.findById(id);
  handleServiceResponse(mapping, res);
}

async function createNewMapping(req: Request, res: Response) {
  const newMapping = await mappingService.create(req.body);
  handleServiceResponse(newMapping, res);
}

async function updateMappingById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const updatedMapping = await mappingService.update(id, req.body);
  handleServiceResponse(updatedMapping, res);
}

async function deleteMappingById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const deleteResponse = await mappingService.delete(id);
  handleServiceResponse(deleteResponse, res);
}
