import { Mock } from 'vitest';

import { MappingUpdate, NewMapping } from '@/api/mapping/mappingModel';
import { mockMapping } from '@/api/mocks';
import { db } from '@/db';

import { mappingRepository } from '../mappingRepository';

vi.mock('@/db');

describe('mappingRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all mappings', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        selectAll: () => ({
          execute: vi.fn().mockResolvedValueOnce([mockMapping]),
        }),
      });

      const result = await mappingRepository.findAll();

      expect(result).toEqual([mockMapping]);
    });
  });

  describe('findById', () => {
    it('should return a mapping by ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockMapping),
          }),
        }),
      });

      const result = await mappingRepository.findById(1);

      expect(result).toEqual(mockMapping);
    });

    it('should return null if mapping not found by ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await mappingRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByValueSetCodeId', () => {
    it('should return a mapping by value set code ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockMapping),
          }),
        }),
      });

      const result = await mappingRepository.findByValueSetCodeId(1);

      expect(result).toEqual(mockMapping);
    });

    it('should return null if mapping not found by value set code ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await mappingRepository.findByValueSetCodeId(999);

      expect(result).toBeNull();
    });
  });

  describe('findByOriginalValue', () => {
    it('should return a mapping by original value', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockMapping),
          }),
        }),
      });

      const result = await mappingRepository.findByOriginalValue('Sample Value');

      expect(result).toEqual(mockMapping);
    });

    it('should return null if mapping not found by original value', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await mappingRepository.findByOriginalValue('Unknown Value');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new mapping', async () => {
      const newMapping: NewMapping = {
        ...mockMapping,
        original_value: 'New Value',
        value_set_code_id: 1,
        last_update: new Date(),
      };

      (db.insertInto as Mock).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returningAll: vi.fn().mockReturnValueOnce({
            executeTakeFirstOrThrow: vi.fn().mockResolvedValueOnce(mockMapping),
          }),
        }),
      });

      const result = await mappingRepository.create(newMapping);

      expect(result).toEqual(mockMapping);
    });
  });

  describe('update', () => {
    it('should update an existing mapping', async () => {
      const mappingUpdate: MappingUpdate = { original_value: 'Updated Value' };

      (db.updateTable as Mock).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returningAll: vi.fn().mockReturnValueOnce({
              executeTakeFirst: vi.fn().mockResolvedValueOnce(mockMapping),
            }),
          }),
        }),
      });

      const result = await mappingRepository.update(1, mappingUpdate);

      expect(result).toEqual(mockMapping);
    });

    it('should return null if mapping not found for update', async () => {
      const mappingUpdate: MappingUpdate = { original_value: 'Updated Value' };

      (db.updateTable as Mock).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returningAll: vi.fn().mockReturnValueOnce({
              executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
            }),
          }),
        }),
      });

      const result = await mappingRepository.update(999, mappingUpdate);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a mapping by ID', async () => {
      (db.deleteFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          execute: vi.fn().mockResolvedValueOnce(undefined),
        }),
      });

      await mappingRepository.delete(1);

      expect(db.deleteFrom).toHaveBeenCalled();
    });
  });
});
