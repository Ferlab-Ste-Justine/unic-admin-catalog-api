import { Mock } from 'vitest'; // Adjust the import path as needed

import { mockValueSetCode } from '@/api/mocks'; // You need to create this mock if it doesn't exist
import { NewValueSetCode, ValueSetCodeUpdate } from '@/api/valueSetCode/valueSetCodeModel';
import { db } from '@/db';

import { valueSetCodeRepository } from '../valueSetCodeRepository';

vi.mock('@/db'); // Mock the db module

describe('valueSetCodeRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mock calls between tests
  });

  describe('findAll', () => {
    it('should return all value set codes', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        selectAll: vi.fn().mockReturnValueOnce({
          execute: vi.fn().mockResolvedValueOnce([mockValueSetCode]),
        }),
      });

      const result = await valueSetCodeRepository.findAll();

      expect(result).toEqual([mockValueSetCode]);
    });
  });

  describe('findById', () => {
    it('should return a value set code by ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockValueSetCode),
          }),
        }),
      });

      const result = await valueSetCodeRepository.findById(1);

      expect(result).toEqual(mockValueSetCode);
    });

    it('should return null if value set code not found', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await valueSetCodeRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByValueSetId', () => {
    it('should return a value set code by value set ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockValueSetCode),
          }),
        }),
      });

      const result = await valueSetCodeRepository.findByValueSetId(1);

      expect(result).toEqual(mockValueSetCode);
    });

    it('should return null if value set code not found by value set ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await valueSetCodeRepository.findByValueSetId(999);

      expect(result).toBeNull();
    });
  });

  describe('findByCode', () => {
    it('should return a value set code by code', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockValueSetCode),
          }),
        }),
      });

      const result = await valueSetCodeRepository.findByCode('some_code');

      expect(result).toEqual(mockValueSetCode);
    });

    it('should return null if value set code not found by code', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await valueSetCodeRepository.findByCode('unknown_code');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new value set code', async () => {
      const newValueSetCode: NewValueSetCode = { ...mockValueSetCode, value_set_id: 2 };

      (db.insertInto as Mock).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returningAll: vi.fn().mockReturnValueOnce({
            executeTakeFirstOrThrow: vi.fn().mockResolvedValueOnce(mockValueSetCode),
          }),
        }),
      });

      const result = await valueSetCodeRepository.create(newValueSetCode);

      expect(result).toEqual(mockValueSetCode);
    });
  });

  describe('update', () => {
    it('should update a value set code', async () => {
      const valueSetCodeUpdate: ValueSetCodeUpdate = {
        ...mockValueSetCode,
        code: 'NewCode',
      };

      (db.updateTable as Mock).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returningAll: vi.fn().mockReturnValueOnce({
              executeTakeFirst: vi.fn().mockResolvedValueOnce(mockValueSetCode),
            }),
          }),
        }),
      });

      const result = await valueSetCodeRepository.update(1, valueSetCodeUpdate);

      expect(result).toEqual(mockValueSetCode);
    });

    it('should return null if value set code not found for update', async () => {
      const valueSetCodeUpdate: ValueSetCodeUpdate = {
        ...mockValueSetCode,
        code: 'NewCode',
      };

      (db.updateTable as Mock).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returningAll: vi.fn().mockReturnValueOnce({
              executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
            }),
          }),
        }),
      });

      const result = await valueSetCodeRepository.update(999, valueSetCodeUpdate);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a value set code', async () => {
      (db.deleteFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          execute: vi.fn().mockResolvedValueOnce(undefined),
        }),
      });

      await valueSetCodeRepository.delete(1);

      expect(db.deleteFrom).toHaveBeenCalled();
    });
  });
});
