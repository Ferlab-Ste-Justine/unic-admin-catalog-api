import { StatusCodes } from 'http-status-codes';

import { validateDictTableId, validateValueSetId } from '@/api/helpers';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import { SortOrder } from '@/types';

import { NewVariable, Variable, VariableSearchFields, VariableSortColumn, VariableUpdate } from './variableModel';
import { variableRepository } from './variableRepository';

export const variableService = {
  findAll: async (
    searchField?: VariableSearchFields,
    searchValue?: string,
    sortBy?: VariableSortColumn,
    sortOrder: SortOrder = 'asc',
    limit: number = 50,
    offset: number = 0
  ): Promise<ServiceResponse<Variable[] | null>> => {
    try {
      const variables = await variableRepository.findAll(searchField, searchValue, sortBy, sortOrder, limit, offset);
      if (!variables.length) {
        return new ServiceResponse(ResponseStatus.Success, 'No Variables found', [], StatusCodes.OK);
      }
      return new ServiceResponse(ResponseStatus.Success, 'Variables found', variables, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error finding all variables: ${(error as Error).message}`;
      logger.error(errorMessage);

      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findById: async (id: number): Promise<ServiceResponse<Variable | null>> => {
    try {
      const variable = await variableRepository.findById(id);
      if (variable) {
        return new ServiceResponse(ResponseStatus.Success, 'Variable found', variable, StatusCodes.OK);
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'Variable not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (error) {
      const errorMessage = `Error finding variable with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  create: async (variable: NewVariable): Promise<ServiceResponse<Variable | null>> => {
    try {
      const valueSetValidation = await validateValueSetId(variable.value_set_id);
      if (!valueSetValidation.success) {
        return valueSetValidation;
      }

      const tableValidation = await validateDictTableId(variable.table_id);
      if (!tableValidation.success) {
        return tableValidation;
      }

      const uniquenessCheck = await handleUniquenessChecks(variable);
      if (!uniquenessCheck.success) {
        return uniquenessCheck;
      }

      const newVariable = await variableRepository.create(variable);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Variable created successfully',
        newVariable,
        StatusCodes.CREATED
      );
    } catch (error) {
      const errorMessage = `Error creating variable: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  update: async (id: number, variable: VariableUpdate): Promise<ServiceResponse<Variable | null>> => {
    try {
      const valueSetValidation = await validateValueSetId(variable.value_set_id);
      if (!valueSetValidation.success) {
        return valueSetValidation;
      }

      const tableValidation = await validateDictTableId(variable.table_id);
      if (!tableValidation.success) {
        return tableValidation;
      }

      const uniquenessCheck = await handleUniquenessChecks(variable, id);
      if (!uniquenessCheck.success) {
        return uniquenessCheck;
      }

      const updatedVariable = await variableRepository.update(id, variable);

      if (updatedVariable) {
        return new ServiceResponse(
          ResponseStatus.Success,
          'Variable updated successfully',
          updatedVariable,
          StatusCodes.OK
        );
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'Variable not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (error) {
      const errorMessage = `Error updating variable with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  delete: async (id: number): Promise<ServiceResponse> => {
    try {
      await variableRepository.delete(id);
      return new ServiceResponse(ResponseStatus.Success, 'Variable deleted successfully', null, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error deleting variable with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

const handleUniquenessChecks = async (
  variable: NewVariable | VariableUpdate,
  id?: number
): Promise<ServiceResponse<null>> => {
  if (variable.path) {
    const existingByPath = await variableRepository.findByPath(variable.path);
    if (existingByPath && existingByPath.id !== id) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `A Variable with path ${variable.path} already exists.`,
        null,
        StatusCodes.CONFLICT
      );
    }
  }

  return new ServiceResponse(ResponseStatus.Success, 'Uniqueness checks passed', null, StatusCodes.OK);
};
