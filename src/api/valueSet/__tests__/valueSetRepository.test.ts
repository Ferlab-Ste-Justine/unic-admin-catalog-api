import { Mock } from 'vitest';

import { mockValueSet } from '@/api/mocks';
import { NewValueSet } from '@/api/valueSet/valueSetModel';
import { valueSetRepository } from '@/api/valueSet/valueSetRepository';
import { db } from '@/db';

vi.mock('@/db');

describe('valueSetRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all value sets with no search or sort', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        selectAll: () => ({
          execute: vi.fn().mockResolvedValueOnce([mockValueSet]),
        }),
      });

      const result = await valueSetRepository.findAll();

      expect(result).toEqual([mockValueSet]);
    });

    it('should apply search criteria', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        selectAll: () => ({
          where: vi.fn().mockReturnValueOnce({
            execute: vi.fn().mockResolvedValueOnce([mockValueSet]),
          }),
        }),
      });

      const result = await valueSetRepository.findAll('name', 'TestValueSet');

      expect(result).toEqual([mockValueSet]);
    });

    it('should apply sorting', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        selectAll: () => ({
          orderBy: vi.fn().mockReturnValueOnce({
            execute: vi.fn().mockResolvedValueOnce([mockValueSet]),
          }),
        }),
      });

      const result = await valueSetRepository.findAll(undefined, undefined, 'name', 'asc');

      expect(result).toEqual([mockValueSet]);
    });
  });

  describe('findById', () => {
    it('should return a value set by ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockValueSet),
          }),
        }),
      });

      const result = await valueSetRepository.findById(1);

      expect(result).toEqual(mockValueSet);
    });

    it('should return null if value set not found', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await valueSetRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return a value set by name', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockValueSet),
          }),
        }),
      });

      const result = await valueSetRepository.findByName('TestValueSet');

      expect(result).toEqual(mockValueSet);
    });

    it('should return null if value set not found by name', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await valueSetRepository.findByName('Unknown');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new value set', async () => {
      const newValueSet: NewValueSet = { name: 'NewValueSet', last_update: new Date() };

      (db.insertInto as Mock).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returningAll: vi.fn().mockReturnValueOnce({
            executeTakeFirstOrThrow: vi.fn().mockResolvedValueOnce(mockValueSet),
          }),
        }),
      });

      const result = await valueSetRepository.create(newValueSet);

      expect(result).toEqual(mockValueSet);
    });
  });

  describe('update', () => {
    it('should update a value set', async () => {
      const valueSetUpdate = { name: 'UpdatedValueSet' };

      (db.updateTable as Mock).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returningAll: vi.fn().mockReturnValueOnce({
              executeTakeFirst: vi.fn().mockResolvedValueOnce(mockValueSet),
            }),
          }),
        }),
      });

      const result = await valueSetRepository.update(1, valueSetUpdate);

      expect(result).toEqual(mockValueSet);
    });

    it('should return null if value set not found for update', async () => {
      const valueSetUpdate = { name: 'UpdatedValueSet' };

      (db.updateTable as Mock).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returningAll: vi.fn().mockReturnValueOnce({
              executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
            }),
          }),
        }),
      });

      const result = await valueSetRepository.update(999, valueSetUpdate);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a value set', async () => {
      (db.deleteFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          execute: vi.fn().mockResolvedValueOnce(undefined),
        }),
      });

      await valueSetRepository.delete(1);

      expect(db.deleteFrom).toHaveBeenCalled();
    });
  });
});
