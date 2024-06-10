import { StatusCodes } from 'http-status-codes';

import { analystRepository } from '@/api/analyst/analystRepository';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { Resource } from './resourceModel';
import { resourceRepository } from './resourceRepository';

export const resourceService = {
  findAll: async (name?: string): Promise<ServiceResponse<Resource[] | null>> => {
    try {
      const resources = await resourceRepository.findAllResources(name);
      if (!resources.length) {
        return new ServiceResponse(ResponseStatus.Failed, 'No resources found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<Resource[]>(ResponseStatus.Success, 'Resources found', resources, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error finding all resources: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findById: async (id: number): Promise<ServiceResponse<Resource | null>> => {
    try {
      const resource = await resourceRepository.findResourceById(id);
      if (!resource) {
        return new ServiceResponse(ResponseStatus.Failed, 'Resource not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<Resource>(ResponseStatus.Success, 'Resource found', resource, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error finding resource with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  create: async (resource: Omit<Resource, 'id' | 'last_update'>): Promise<ServiceResponse<Resource | null>> => {
    try {
      if (resource.analyst_id) {
        const analystExists = await analystRepository.findAnalystById(resource.analyst_id);
        if (!analystExists) {
          return new ServiceResponse(ResponseStatus.Failed, 'Analyst ID does not exist', null, StatusCodes.BAD_REQUEST);
        }
      }

      const createdResource = await resourceRepository.createResource(resource);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Resource created successfully',
        createdResource,
        StatusCodes.CREATED
      );
    } catch (error) {
      const errorMessage = `Error creating resource: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  update: async (
    id: number,
    resource: Omit<Resource, 'id' | 'last_update'>
  ): Promise<ServiceResponse<Resource | null>> => {
    try {
      const updatedResource = await resourceRepository.updateResource(id, resource);
      if (!updatedResource) {
        return new ServiceResponse(ResponseStatus.Failed, 'Resource not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<Resource>(
        ResponseStatus.Success,
        'Resource updated successfully',
        updatedResource,
        StatusCodes.OK
      );
    } catch (error) {
      const errorMessage = `Error updating resource with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  delete: async (id: number): Promise<ServiceResponse> => {
    try {
      await resourceRepository.deleteResource(id);
      return new ServiceResponse(ResponseStatus.Success, 'Resource deleted successfully', null, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error deleting resource with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
