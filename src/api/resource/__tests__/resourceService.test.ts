import { StatusCodes } from 'http-status-codes';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { validateAnalystId } from '@/api/helpers';
import { mockResource } from '@/api/mocks';
import { Resource } from '@/api/resource/resourceModel';
import { resourceRepository } from '@/api/resource/resourceRepository';
import { resourceService } from '@/api/resource/resourceService';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

vi.mock('@/api/resource/resourceRepository');
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

  describe('findAll', () => {
    it('should return all resources', async () => {
      (resourceRepository.findAll as Mock).mockResolvedValueOnce([mockResource]);

      const result = await resourceService.findAll();

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Resources found', [mockResource], StatusCodes.OK)
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

    it('should handle search and sort options', async () => {
      (resourceRepository.findAll as Mock).mockResolvedValueOnce([mockResource]);

      const result = await resourceService.findAll('name', 'Resource 1', 'code', 'asc');

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Resources found', [mockResource], StatusCodes.OK)
      );
    });
  });

  describe('findById', () => {
    it('should return a resource by id', async () => {
      (resourceRepository.findById as Mock).mockResolvedValueOnce(mockResource);

      const result = await resourceService.findById(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Resource found', mockResource, StatusCodes.OK)
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
      (resourceRepository.create as Mock).mockResolvedValueOnce(mockResource);

      const result = await resourceService.create(mockResource);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Resource created successfully', mockResource, StatusCodes.CREATED)
      );
    });

    it('should handle validation errors during create', async () => {
      (validateAnalystId as Mock).mockResolvedValueOnce(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid analyst ID', null, StatusCodes.BAD_REQUEST)
      );

      const result = await resourceService.create(mockResource);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid analyst ID', null, StatusCodes.BAD_REQUEST)
      );
    });

    it('should handle uniqueness check errors during create', async () => {
      (resourceRepository.findByCode as Mock).mockResolvedValueOnce(mockResource);

      const result = await resourceService.create(mockResource);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Resource with code ${mockResource.code} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should handle errors during create', async () => {
      (resourceRepository.create as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await resourceService.create(mockResource);

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
    const updatedResource: Resource = {
      ...mockResource,
      name: 'Updated Resource',
    };

    it('should update an existing resource', async () => {
      (resourceRepository.update as Mock).mockResolvedValueOnce(updatedResource);

      const result = await resourceService.update(1, updatedResource);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Resource updated successfully', updatedResource, StatusCodes.OK)
      );
    });

    it('should handle validation errors during update', async () => {
      (validateAnalystId as Mock).mockResolvedValueOnce(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid analyst ID', null, StatusCodes.BAD_REQUEST)
      );

      const result = await resourceService.update(1, updatedResource);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid analyst ID', null, StatusCodes.BAD_REQUEST)
      );
    });

    it('should handle uniqueness check errors during update', async () => {
      (resourceRepository.findByCode as Mock).mockResolvedValueOnce({ ...mockResource, id: 2 });

      const result = await resourceService.update(1, { ...updatedResource, code: mockResource.code });

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Resource with code ${mockResource.code} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
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
