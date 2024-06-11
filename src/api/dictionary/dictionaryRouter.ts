import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import verifyToken from '@/common/middleware/verifyToken';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

import {
  CreateDictionarySchema,
  DeleteDictionarySchema,
  DictionarySchema,
  GetDictionarySchema,
  UpdateDictionarySchema,
} from './dictionaryModel';
import { dictionaryService } from './dictionaryService';

export const dictionaryRegistry = new OpenAPIRegistry();
dictionaryRegistry.register('Dictionary', DictionarySchema);

export const dictionaryRouter: Router = (() => {
  const router = express.Router();

  router.use(verifyToken);

  dictionaryRegistry.registerPath({
    method: 'get',
    path: '/dictionaries',
    tags: ['Dictionary'],
    responses: createApiResponse(z.array(DictionarySchema), 'Success'),
  });
  router.get('/', getAllDictionaries);

  dictionaryRegistry.registerPath({
    method: 'get',
    path: '/dictionaries/{id}',
    tags: ['Dictionary'],
    request: {
      params: GetDictionarySchema.shape.params,
    },
    responses: createApiResponse(DictionarySchema, 'Success'),
  });
  router.get('/:id', validateRequest(GetDictionarySchema), getDictionaryById);

  dictionaryRegistry.registerPath({
    method: 'post',
    path: '/dictionaries',
    tags: ['Dictionary'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateDictionarySchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(DictionarySchema, 'Success'),
  });
  router.post('/', validateRequest(CreateDictionarySchema), createNewDictionary);

  dictionaryRegistry.registerPath({
    method: 'put',
    path: '/dictionaries/{id}',
    tags: ['Dictionary'],
    request: {
      params: UpdateDictionarySchema.shape.params,
      body: {
        content: {
          'application/json': {
            schema: UpdateDictionarySchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(DictionarySchema, 'Success'),
  });
  router.put('/:id', validateRequest(UpdateDictionarySchema), updateDictionaryById);

  dictionaryRegistry.registerPath({
    method: 'delete',
    path: '/dictionaries/{id}',
    tags: ['Dictionary'],
    request: {
      params: DeleteDictionarySchema.shape.params,
    },
    responses: createApiResponse(DictionarySchema, 'Success'),
  });
  router.delete('/:id', validateRequest(DeleteDictionarySchema), deleteDictionaryById);

  return router;
})();

async function getAllDictionaries(req: Request, res: Response) {
  const dictionaries = await dictionaryService.findAll();
  handleServiceResponse(dictionaries, res);
}

async function getDictionaryById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const dictionary = await dictionaryService.findById(id);
  handleServiceResponse(dictionary, res);
}

async function createNewDictionary(req: Request, res: Response) {
  const newDictionary = await dictionaryService.create(req.body);
  handleServiceResponse(newDictionary, res);
}

async function updateDictionaryById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const updatedDictionary = await dictionaryService.update(id, req.body);
  handleServiceResponse(updatedDictionary, res);
}

async function deleteDictionaryById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const deleteResponse = await dictionaryService.delete(id);
  handleServiceResponse(deleteResponse, res);
}
