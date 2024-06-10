import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { Analyst } from './analystModel';
import { analystRepository } from './analystRepository';

export const analystService = {
  findAll: async (name?: string): Promise<ServiceResponse<Analyst[] | null>> => {
    try {
      const analysts = await analystRepository.findAllAnalysts(name);
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
      const analyst = await analystRepository.findAnalystById(id);
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

  create: async (analyst: Omit<Analyst, 'id' | 'last_update'>): Promise<ServiceResponse<Analyst | null>> => {
    try {
      const newAnalyst = await analystRepository.createAnalyst(analyst);
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

  update: async (
    id: number,
    analyst: Omit<Analyst, 'id' | 'last_update'>
  ): Promise<ServiceResponse<Analyst | null>> => {
    try {
      const updatedAnalyst = await analystRepository.updateAnalyst(id, analyst);
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
      await analystRepository.deleteAnalyst(id);
      return new ServiceResponse(ResponseStatus.Success, 'Analyst deleted successfully', null, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error deleting analyst with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
