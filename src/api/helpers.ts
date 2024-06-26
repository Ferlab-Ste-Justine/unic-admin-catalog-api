import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { analystRepository } from '@/api/analyst/analystRepository';
import { dictionaryRepository } from '@/api/dictionary/dictionaryRepository';
import { dictTableRepository } from '@/api/dictTable/dictTableRepository';
import { resourceRepository } from '@/api/resource/resourceRepository';
import { valueSetRepository } from '@/api/valueSet/valueSetRepository';
import { valueSetCodeRepository } from '@/api/valueSetCode/valueSetCodeRepository';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from '@/constants';

export const validateValueSetId = async (value_set_id?: number): Promise<ServiceResponse<null>> => {
  if (value_set_id) {
    const valueSetExists = await valueSetRepository.findById(value_set_id);
    if (!valueSetExists) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `Value Set with ID ${value_set_id} does not exist`,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }
  return new ServiceResponse(ResponseStatus.Success, 'Value Set ID is valid', null, StatusCodes.OK);
};

export const validateValueSetCodeId = async (value_set_code_id?: number): Promise<ServiceResponse<null>> => {
  if (value_set_code_id) {
    const valueSetCodeExists = await valueSetCodeRepository.findById(value_set_code_id);
    if (!valueSetCodeExists) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `Value Set Code with ID ${value_set_code_id} does not exist`,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }
  return new ServiceResponse(ResponseStatus.Success, 'Value Set Code ID is valid', null, StatusCodes.OK);
};

export const validateDictTableId = async (table_id?: number): Promise<ServiceResponse<null>> => {
  if (table_id) {
    const dictTableExists = await dictTableRepository.findById(table_id);
    if (!dictTableExists) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `Dict Table with ID ${table_id} does not exist`,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }
  return new ServiceResponse(ResponseStatus.Success, 'Dict Table ID is valid', null, StatusCodes.OK);
};

export const validateResourceId = async (resource_id?: number): Promise<ServiceResponse<null>> => {
  if (resource_id) {
    const resourceExists = await resourceRepository.findById(resource_id);
    if (!resourceExists) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `Resource with ID ${resource_id} does not exist`,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }
  return new ServiceResponse(ResponseStatus.Success, 'Resource ID is valid', null, StatusCodes.OK);
};

export const validateAnalystId = async (analyst_id?: number): Promise<ServiceResponse<null>> => {
  if (analyst_id) {
    const analystExists = await analystRepository.findById(analyst_id);
    if (!analystExists) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `Analyst with ID ${analyst_id} does not exist`,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }
  return new ServiceResponse(ResponseStatus.Success, 'Analyst ID is valid', null, StatusCodes.OK);
};

export const validateDictionaryId = async (dictionary_id?: number): Promise<ServiceResponse<null>> => {
  if (dictionary_id) {
    const dictionaryExists = await dictionaryRepository.findById(dictionary_id);
    if (!dictionaryExists) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `Dictionary with ID ${dictionary_id} does not exist`,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }
  return new ServiceResponse(ResponseStatus.Success, 'Dictionary ID is valid', null, StatusCodes.OK);
};

export const generateAccessToken = (user_id: number): string => {
  return jwt.sign({ user_id }, JWT_SECRET, { expiresIn: '1h' });
};

export const generateRefreshToken = (user_id: number): string => {
  return jwt.sign({ user_id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};
