import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import verifyToken from '@/common/middleware/verifyToken';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

import {
  CreateDictTableSchema,
  DictTableSchema,
  GetDictTableSchema,
  GetDictTablesSchema,
  UpdateDictTableSchema,
} from './dictTableModel';
import { dictTableService } from './dictTableService';

export const dictTableRegistry = new OpenAPIRegistry();
dictTableRegistry.register('DictTable', DictTableSchema);

export const dictTableRouter: Router = (() => {
  const router = express.Router();

  router.use(verifyToken);

  dictTableRegistry.registerPath({
    method: 'get',
    path: '/dict-tables',
    tags: ['Dict Table'],
    request: {
      query: GetDictTablesSchema.shape.query,
    },
    responses: createApiResponse(z.array(DictTableSchema), 'Success'),
  });
  router.get('/', validateRequest(GetDictTablesSchema), getAllDictTables);

  dictTableRegistry.registerPath({
    method: 'get',
    path: '/dict-tables/{id}',
    tags: ['Dict Table'],
    request: {
      params: GetDictTableSchema.shape.params,
    },
    responses: createApiResponse(DictTableSchema, 'Success'),
  });
  router.get('/:id', validateRequest(GetDictTableSchema), getDictTableById);

  dictTableRegistry.registerPath({
    method: 'post',
    path: '/dict-tables',
    tags: ['Dict Table'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateDictTableSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(DictTableSchema, 'Success'),
  });
  router.post('/', validateRequest(CreateDictTableSchema), createNewDictTable);

  dictTableRegistry.registerPath({
    method: 'put',
    path: '/dict-tables/{id}',
    tags: ['Dict Table'],
    request: {
      params: UpdateDictTableSchema.shape.params,
      body: {
        content: {
          'application/json': {
            schema: UpdateDictTableSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(DictTableSchema, 'Success'),
  });
  router.put('/:id', validateRequest(UpdateDictTableSchema), updateDictTableById);

  dictTableRegistry.registerPath({
    method: 'delete',
    path: '/dict-tables/{id}',
    tags: ['Dict Table'],
    request: {
      params: GetDictTableSchema.shape.params,
    },
    responses: createApiResponse(DictTableSchema, 'Success'),
  });
  router.delete('/:id', validateRequest(GetDictTableSchema), deleteDictTableById);

  return router;
})();

async function getAllDictTables(req: Request, res: Response) {
  const search = req.query.name as string | undefined;
  const dictTables = await dictTableService.findAll(search);
  handleServiceResponse(dictTables, res);
}

async function getDictTableById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const dictTable = await dictTableService.findById(id);
  handleServiceResponse(dictTable, res);
}

async function createNewDictTable(req: Request, res: Response) {
  const newDictTable = await dictTableService.create(req.body);
  handleServiceResponse(newDictTable, res);
}

async function updateDictTableById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const updatedDictTable = await dictTableService.update(id, req.body);
  handleServiceResponse(updatedDictTable, res);
}

async function deleteDictTableById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const deleteResponse = await dictTableService.delete(id);
  handleServiceResponse(deleteResponse, res);
}
