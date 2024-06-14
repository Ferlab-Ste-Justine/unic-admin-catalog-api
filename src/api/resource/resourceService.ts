import { StatusCodes } from 'http-status-codes';

import { validateAnalystId } from '@/api/helpers';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import { SortOrder } from '@/types';

import { NewResource, Resource, ResourceSearchFields, ResourceSortColumn, ResourceUpdate } from './resourceModel';
import { resourceRepository } from './resourceRepository';

export const resourceService = {
  findAll: async (
    searchField?: ResourceSearchFields,
    searchValue?: string,
    sortBy?: ResourceSortColumn,
    sortOrder: SortOrder = 'asc'
  ): Promise<ServiceResponse<Resource[] | null>> => {
    try {
      const resources = await resourceRepository.findAll(searchField, searchValue, sortBy, sortOrder);
      if (!resources.length) {
        return new ServiceResponse(ResponseStatus.Failed, 'No resources found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse(ResponseStatus.Success, 'Resources found', resources, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error finding all resources: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findById: async (id: number): Promise<ServiceResponse<Resource | null>> => {
    try {
      const resource = await resourceRepository.findById(id);
      if (!resource) {
        return new ServiceResponse(ResponseStatus.Failed, 'Resource not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse(ResponseStatus.Success, 'Resource found', resource, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error finding resource with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  create: async (resource: NewResource): Promise<ServiceResponse<Resource | null>> => {
    try {
      const analystValidation = await validateAnalystId(resource.analyst_id);
      if (!analystValidation.success) {
        return analystValidation;
      }

      const uniquenessCheck = await handleUniquenessChecks(resource);
      if (!uniquenessCheck.success) {
        return uniquenessCheck;
      }

      const createdResource = await resourceRepository.create(resource);
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

  update: async (id: number, resource: ResourceUpdate): Promise<ServiceResponse<Resource | null>> => {
    try {
      const analystValidation = await validateAnalystId(resource.analyst_id);
      if (!analystValidation.success) {
        return analystValidation;
      }

      const uniquenessCheck = await handleUniquenessChecks(resource, id);
      if (!uniquenessCheck.success) {
        return uniquenessCheck;
      }

      const updatedResource = await resourceRepository.update(id, resource);
      if (!updatedResource) {
        return new ServiceResponse(ResponseStatus.Failed, 'Resource not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse(
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
      await resourceRepository.delete(id);
      return new ServiceResponse(ResponseStatus.Success, 'Resource deleted successfully', null, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error deleting resource with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

const handleUniquenessChecks = async (
  resource: NewResource | ResourceUpdate,
  id?: number
): Promise<ServiceResponse<null>> => {
  if (resource.code) {
    const existingByCode = await resourceRepository.findByCode(resource.code);
    if (existingByCode && existingByCode.id !== id) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `A Resource with code ${resource.code} already exists.`,
        null,
        StatusCodes.CONFLICT
      );
    }
  }

  return new ServiceResponse(ResponseStatus.Success, 'Uniqueness checks passed', null, StatusCodes.OK);
};
