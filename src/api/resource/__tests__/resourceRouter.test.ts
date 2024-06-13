import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { Mock, vi } from 'vitest';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

import { Resource } from '../resourceModel';
import { resourceService } from '../resourceService';

vi.mock('../resourceService');

vi.mock('@/common/middleware/verifyToken', () => ({
  default: (req: Request, res: Response, next: NextFunction) => next(),
}));

describe('Resource API endpoints', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const resourceMock: Resource = {
    id: 1,
    last_update: '2024-06-13T19:53:41.824Z' as unknown as Date,
    code: 'R1',
    name: 'Resource 1',
    title: 'Title 1',
    resource_type: 'warehouse',
    description_en: 'Description in English',
    description_fr: 'Description in French',
    principal_investigator: 'Investigator Name',
    erb_project_id: 'ERB123',
    project_creation_date: '2024-06-13T19:53:41.824Z' as unknown as Date,
    project_active: 'active',
    project_status: 'in progress',
    project_approved: true,
    project_folder: 'folder/path',
    project_approval_date: '2024-06-13T19:53:41.824Z' as unknown as Date,
    project_completion_date: '2024-06-13T19:53:41.824Z' as unknown as Date,
    to_be_published: true,
    system_database_type: 'Type A',
    analyst_id: 1,
    system_collection_starting_year: 2020,
    analyst_name: 'Analyst Name',
  };

  describe('GET /resources', () => {
    it('should return a list of resources', async () => {
      const resources: Resource[] = [resourceMock];

      (resourceService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Resources found', [resourceMock], StatusCodes.OK)
      );

      const response = await request(app).get('/resources');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(resources);
    });

    it('should apply search filters', async () => {
      const resources: Resource[] = [resourceMock];

      (resourceService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Resources found', [resourceMock], StatusCodes.OK)
      );

      const response = await request(app).get('/resources?searchField=name&searchValue=Resource 1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(resources);
    });
  });

  describe('GET /resources/:id', () => {
    it('should return a single resource by id', async () => {
      (resourceService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Resource found', resourceMock, StatusCodes.OK)
      );

      const response = await request(app).get('/resources/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(resourceMock);
    });
  });

  describe('POST /resources', () => {
    it('should create a new resource', async () => {
      (resourceService.create as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Resource created', resourceMock, StatusCodes.OK)
      );

      const response = await request(app).post('/resources').send({
        name: 'New Resource',
        code: 'NR',
        title: 'New Title',
        resource_type: 'warehouse',
        description_en: 'New description in English',
        description_fr: 'New description in French',
        principal_investigator: 'New Investigator',
        erb_project_id: 'ERB124',
        project_creation_date: new Date(),
        project_active: 'active',
        project_status: 'in progress',
        project_approved: true,
        project_folder: 'new/folder/path',
        project_approval_date: new Date(),
        project_completion_date: new Date(),
        to_be_published: true,
        system_database_type: 'Type B',
        analyst_id: 1,
        system_collection_starting_year: 2021,
        analyst_name: 'New Analyst Name',
      });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(resourceMock);
    });
  });

  describe('PUT /resources/:id', () => {
    it('should update an existing resource', async () => {
      const updatedResource: Resource = { ...resourceMock, name: 'Updated Resource' };

      (resourceService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Resource updated', updatedResource, StatusCodes.OK)
      );

      const response = await request(app)
        .put('/resources/1')
        .send({ ...resourceMock, name: 'Updated Resource' });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(updatedResource);
    });
  });

  describe('DELETE /resources/:id', () => {
    it('should delete an existing resource', async () => {
      (resourceService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Resource deleted', null, StatusCodes.OK)
      );

      const response = await request(app).delete('/resources/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toBeNull();
    });
  });
});
