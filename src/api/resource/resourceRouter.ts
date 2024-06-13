import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import verifyToken from '@/common/middleware/verifyToken';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';
import { SortOrder } from '@/types';

import {
  CreateResourceSchema,
  DeleteResourceSchema,
  GetResourceSchema,
  GetResourcesSchema,
  ResourceSchema,
  ResourceSearchFields,
  ResourceSortColumn,
  UpdateResourceSchema,
} from './resourceModel';
import { resourceService } from './resourceService';

export const resourceRegistry = new OpenAPIRegistry();
resourceRegistry.register('Resource', ResourceSchema);

export const resourceRouter: Router = (() => {
  const router = express.Router();

  router.use(verifyToken);

  resourceRegistry.registerPath({
    method: 'get',
    path: '/resources',
    tags: ['Resource'],
    request: {
      query: GetResourcesSchema.shape.query,
    },
    responses: createApiResponse(z.array(ResourceSchema), 'Success'),
  });
  router.get('/', validateRequest(GetResourcesSchema), getAllResources);

  resourceRegistry.registerPath({
    method: 'get',
    path: '/resources/{id}',
    tags: ['Resource'],
    request: {
      params: GetResourceSchema.shape.params,
    },
    responses: createApiResponse(ResourceSchema, 'Success'),
  });
  router.get('/:id', validateRequest(GetResourceSchema), getResourceById);

  resourceRegistry.registerPath({
    method: 'post',
    path: '/resources',
    tags: ['Resource'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateResourceSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(ResourceSchema, 'Success'),
  });
  router.post('/', validateRequest(CreateResourceSchema), createNewResource);

  resourceRegistry.registerPath({
    method: 'put',
    path: '/resources/{id}',
    tags: ['Resource'],
    request: {
      params: UpdateResourceSchema.shape.params,
      body: {
        content: {
          'application/json': {
            schema: UpdateResourceSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(ResourceSchema, 'Success'),
  });
  router.put('/:id', validateRequest(UpdateResourceSchema), updateResourceById);

  resourceRegistry.registerPath({
    method: 'delete',
    path: '/resources/{id}',
    tags: ['Resource'],
    request: {
      params: DeleteResourceSchema.shape.params,
    },
    responses: createApiResponse(ResourceSchema, 'Success'),
  });
  router.delete('/:id', validateRequest(DeleteResourceSchema), deleteResourceById);

  return router;
})();

async function getAllResources(req: Request, res: Response) {
  const searchField = req.query.searchField as ResourceSearchFields | undefined;
  const searchValue = req.query.searchValue as string | undefined;
  const sortBy = req.query.sortBy as ResourceSortColumn | undefined;
  const sortOrder = (req.query.sortOrder as SortOrder) || 'asc';
  const resources = await resourceService.findAll(searchField, searchValue, sortBy, sortOrder);
  handleServiceResponse(resources, res);
}

async function getResourceById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const resource = await resourceService.findById(id);
  handleServiceResponse(resource, res);
}

async function createNewResource(req: Request, res: Response) {
  const newResource = await resourceService.create(req.body);
  handleServiceResponse(newResource, res);
}

async function updateResourceById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const updatedResource = await resourceService.update(id, req.body);
  handleServiceResponse(updatedResource, res);
}

async function deleteResourceById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const deleteResponse = await resourceService.delete(id);
  handleServiceResponse(deleteResponse, res);
}
