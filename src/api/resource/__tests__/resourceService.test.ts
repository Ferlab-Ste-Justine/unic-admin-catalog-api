import { StatusCodes } from 'http-status-codes';
import { beforeEach, Mock } from 'vitest';

import { validateAnalystId } from '@/api/helpers';
import { Resource } from '@/api/resource/resourceModel';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

import { resourceRepository } from '../resourceRepository';
import { resourceService } from '../resourceService';

vi.mock('../resourceRepository');
vi.mock('@/api/helpers', () => ({
  validateAnalystId: vi.fn(),
}));

describe('resourceService', () => {
  beforeEach(() => {
    (validateAnalystId as Mock).mockResolvedValue(
      new ServiceResponse(ResponseStatus.Success, 'Analyst ID is valid', null, StatusCodes.OK)
    );
  });

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

  describe('findAll', () => {
    it('should return all resources', async () => {
      (resourceRepository.findAll as Mock).mockResolvedValueOnce([resourceMock]);

      const result = await resourceService.findAll();

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Resources found', [resourceMock], StatusCodes.OK)
      );
    });

    it('should return no resources if none found', async () => {
      (resourceRepository.findAll as Mock).mockResolvedValueOnce([]);

      const result = await resourceService.findAll();

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'No resources found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during findAll', async () => {
      (resourceRepository.findAll as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await resourceService.findAll();

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error finding all resources: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('findById', () => {
    it('should return a resource by id', async () => {
      (resourceRepository.findById as Mock).mockResolvedValueOnce(resourceMock);

      const result = await resourceService.findById(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Resource found', resourceMock, StatusCodes.OK)
      );
    });

    it('should return not found if resource is not found', async () => {
      (resourceRepository.findById as Mock).mockResolvedValueOnce(null);

      const result = await resourceService.findById(999);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Resource not found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during findById', async () => {
      (resourceRepository.findById as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await resourceService.findById(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error finding resource with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('create', () => {
    it('should create a new resource', async () => {
      (resourceRepository.create as Mock).mockResolvedValueOnce(resourceMock);

      const result = await resourceService.create(resourceMock);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Resource created successfully', resourceMock, StatusCodes.CREATED)
      );
    });

    it('should handle errors during create', async () => {
      (resourceRepository.create as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await resourceService.create(resourceMock);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error creating resource: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('update', () => {
    const updatedResource: any = {
      name: 'Updated Resource',
    };

    it('should update an existing resource', async () => {
      (resourceRepository.update as Mock).mockResolvedValueOnce(updatedResource);

      const result = await resourceService.update(1, updatedResource);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Resource updated successfully', updatedResource, StatusCodes.OK)
      );
    });

    it('should return not found if resource is not found for update', async () => {
      (resourceRepository.update as Mock).mockResolvedValueOnce(null);

      const result = await resourceService.update(999, updatedResource);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Resource not found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during update', async () => {
      (resourceRepository.update as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await resourceService.update(1, updatedResource);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error updating resource with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing resource', async () => {
      (resourceRepository.delete as Mock).mockResolvedValueOnce(null);

      const result = await resourceService.delete(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Resource deleted successfully', null, StatusCodes.OK)
      );
    });

    it('should handle errors during delete', async () => {
      (resourceRepository.delete as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await resourceService.delete(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error deleting resource with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });
});
