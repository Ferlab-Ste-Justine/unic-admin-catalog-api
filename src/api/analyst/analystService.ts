import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { Analyst, AnalystUpdate, NewAnalyst } from './analystModel';
import { analystRepository } from './analystRepository';

export const analystService = {
  findAll: async (name?: string): Promise<ServiceResponse<Analyst[] | null>> => {
    try {
      const analysts = await analystRepository.findAll(name);
      if (!analysts.length) {
        return new ServiceResponse(ResponseStatus.Failed, 'No analysts found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse(ResponseStatus.Success, 'Analysts found', analysts, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error finding all analysts: ${(error as Error).message}`;
      logger.error(errorMessage);

      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findById: async (id: number): Promise<ServiceResponse<Analyst | null>> => {
    try {
      const analyst = await analystRepository.findById(id);
      if (analyst) {
        return new ServiceResponse(ResponseStatus.Success, 'Analyst found', analyst, StatusCodes.OK);
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'Analyst not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (error) {
      const errorMessage = `Error finding analyst with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  create: async (analyst: NewAnalyst): Promise<ServiceResponse<Analyst | null>> => {
    try {
      const uniquenessCheck = await handleUniquenessChecks(analyst);
      if (!uniquenessCheck.success) {
        return uniquenessCheck;
      }

      const newAnalyst = await analystRepository.create(analyst);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Analyst created successfully',
        newAnalyst,
        StatusCodes.CREATED
      );
    } catch (error) {
      const errorMessage = `Error creating analyst: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  update: async (id: number, analyst: AnalystUpdate): Promise<ServiceResponse<Analyst | null>> => {
    try {
      const uniquenessCheck = await handleUniquenessChecks(analyst);
      if (!uniquenessCheck.success) {
        return uniquenessCheck;
      }

      const updatedAnalyst = await analystRepository.update(id, analyst);
      if (updatedAnalyst) {
        return new ServiceResponse(
          ResponseStatus.Success,
          'Analyst updated successfully',
          updatedAnalyst,
          StatusCodes.OK
        );
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'Analyst not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (error) {
      const errorMessage = `Error updating analyst with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  delete: async (id: number): Promise<ServiceResponse> => {
    try {
      await analystRepository.delete(id);
      return new ServiceResponse(ResponseStatus.Success, 'Analyst deleted successfully', null, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error deleting analyst with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

const handleUniquenessChecks = async (
  analyst: NewAnalyst | AnalystUpdate,
  id?: number
): Promise<ServiceResponse<null>> => {
  if (analyst.name) {
    const existingByName = await analystRepository.findByName(analyst.name);
    if (existingByName && existingByName.id !== id) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `An Analyst with name ${analyst.name} already exists.`,
        null,
        StatusCodes.CONFLICT
      );
    }
  }

  return new ServiceResponse(ResponseStatus.Success, 'Uniqueness checks passed', null, StatusCodes.OK);
};
