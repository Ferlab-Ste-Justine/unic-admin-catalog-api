import { StatusCodes } from 'http-status-codes';
import { describe, expect, it, Mock, vi } from 'vitest';

import { analystRepository } from '@/api/analyst/analystRepository';
import { analystService } from '@/api/analyst/analystService';
import { mockAnalyst } from '@/api/mocks';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

vi.mock('@/api/analyst/analystRepository');

describe('analystService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all analysts', async () => {
      (analystRepository.findAll as Mock).mockResolvedValueOnce([mockAnalyst]);

      const result = await analystService.findAll();

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Analysts found', [mockAnalyst], StatusCodes.OK)
      );
    });

    it('should return no analysts if none found', async () => {
      (analystRepository.findAll as Mock).mockResolvedValueOnce([]);

      const result = await analystService.findAll();

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'No analysts found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during findAll', async () => {
      (analystRepository.findAll as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await analystService.findAll();

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error finding all analysts: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });

    it('should handle search and sort options', async () => {
      (analystRepository.findAll as Mock).mockResolvedValueOnce([mockAnalyst]);

      const result = await analystService.findAll('name', 'Analyst 1', 'name', 'asc');

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Analysts found', [mockAnalyst], StatusCodes.OK)
      );
    });
  });

  describe('findById', () => {
    it('should return an analyst by id', async () => {
      (analystRepository.findById as Mock).mockResolvedValueOnce(mockAnalyst);

      const result = await analystService.findById(1);

      expect(result).toEqual(new ServiceResponse(ResponseStatus.Success, 'Analyst found', mockAnalyst, StatusCodes.OK));
    });

    it('should return not found if analyst is not found', async () => {
      (analystRepository.findById as Mock).mockResolvedValueOnce(null);

      const result = await analystService.findById(999);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Analyst not found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during findById', async () => {
      (analystRepository.findById as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await analystService.findById(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error finding analyst with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('create', () => {
    const newAnalyst = {
      ...mockAnalyst,
      name: 'New Analyst',
    };
    it('should create a new analyst', async () => {
      (analystRepository.create as Mock).mockResolvedValueOnce(newAnalyst);

      const result = await analystService.create(newAnalyst);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Analyst created successfully', newAnalyst, StatusCodes.CREATED)
      );
    });

    it('should handle uniqueness check errors during create', async () => {
      (analystRepository.findByName as Mock).mockResolvedValueOnce(newAnalyst);

      const result = await analystService.create(newAnalyst);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `An Analyst with name ${newAnalyst.name} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should handle errors during create', async () => {
      (analystRepository.create as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await analystService.create(newAnalyst);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error creating analyst: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('update', () => {
    const updatedAnalyst = {
      ...mockAnalyst,
      name: 'Updated Analyst',
    };

    it('should update an existing analyst', async () => {
      (analystRepository.update as Mock).mockResolvedValueOnce(updatedAnalyst);

      const result = await analystService.update(1, updatedAnalyst);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Analyst updated successfully', updatedAnalyst, StatusCodes.OK)
      );
    });

    it('should handle uniqueness check errors during update', async () => {
      (analystRepository.findByName as Mock).mockResolvedValueOnce({ ...updatedAnalyst, id: 2 });

      const result = await analystService.update(1, updatedAnalyst);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `An Analyst with name ${updatedAnalyst.name} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should return not found if analyst is not found for update', async () => {
      (analystRepository.update as Mock).mockResolvedValueOnce(null);

      const result = await analystService.update(999, updatedAnalyst);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Analyst not found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during update', async () => {
      (analystRepository.update as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await analystService.update(1, updatedAnalyst);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error updating analyst with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing analyst', async () => {
      (analystRepository.delete as Mock).mockResolvedValueOnce(null);

      const result = await analystService.delete(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Analyst deleted successfully', null, StatusCodes.OK)
      );
    });

    it('should handle errors during delete', async () => {
      (analystRepository.delete as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await analystService.delete(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error deleting analyst with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });
});
