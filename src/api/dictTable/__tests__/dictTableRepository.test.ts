import { Mock } from 'vitest'; // Adjust the import path as needed

import { DictTableUpdate, NewDictTable } from '@/api/dictTable/dictTableModel';
import { mockDictTable } from '@/api/mocks';
import { db } from '@/db';

import { dictTableRepository } from '../dictTableRepository';

vi.mock('@/db'); // Mock the db module

describe('dictTableRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mock calls between tests
  });

  describe('findAll', () => {
    it('should return all dictTables with no search or sort', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        selectAll: () => ({
          execute: vi.fn().mockResolvedValueOnce([mockDictTable]),
        }),
      });

      const result = await dictTableRepository.findAll();

      expect(result).toEqual([mockDictTable]);
    });

    it('should apply search criteria', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        selectAll: () => ({
          where: vi.fn().mockReturnValueOnce({
            execute: vi.fn().mockResolvedValueOnce([mockDictTable]),
          }),
        }),
      });

      const result = await dictTableRepository.findAll('name', 'John');

      expect(result).toEqual([mockDictTable]);
    });

    it('should apply sorting', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        selectAll: () => ({
          orderBy: vi.fn().mockReturnValueOnce({
            execute: vi.fn().mockResolvedValueOnce([mockDictTable]),
          }),
        }),
      });

      const result = await dictTableRepository.findAll(undefined, undefined, 'name', 'asc');

      expect(result).toEqual([mockDictTable]);
    });
  });

  describe('findById', () => {
    it('should return a dictTable by ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockDictTable),
          }),
        }),
      });

      const result = await dictTableRepository.findById(1);

      expect(result).toEqual(mockDictTable);
    });

    it('should return null if dictTable not found by ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await dictTableRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByDictionaryId', () => {
    it('should return a dictTable by dictionary ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockDictTable),
          }),
        }),
      });

      const result = await dictTableRepository.findByDictionaryId(1);

      expect(result).toEqual(mockDictTable);
    });

    it('should return null if dictTable not found by dictionary ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await dictTableRepository.findByDictionaryId(999);

      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return a dictTable by name', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockDictTable),
          }),
        }),
      });

      const result = await dictTableRepository.findByName('Sample Name');

      expect(result).toEqual(mockDictTable);
    });

    it('should return null if dictTable not found by name', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await dictTableRepository.findByName('Unknown Name');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new dictTable', async () => {
      const newDictTable: NewDictTable = {
        ...mockDictTable,
        name: 'New Dict',
        dictionary_id: 1,
        last_update: new Date(),
      };

      (db.insertInto as Mock).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returningAll: vi.fn().mockReturnValueOnce({
            executeTakeFirstOrThrow: vi.fn().mockResolvedValueOnce(mockDictTable),
          }),
        }),
      });

      const result = await dictTableRepository.create(newDictTable);

      expect(result).toEqual(mockDictTable);
    });
  });

  describe('update', () => {
    it('should update an existing dictTable', async () => {
      const dictTableUpdate: DictTableUpdate = { name: 'Updated Name' };

      (db.updateTable as Mock).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returningAll: vi.fn().mockReturnValueOnce({
              executeTakeFirst: vi.fn().mockResolvedValueOnce(mockDictTable),
            }),
          }),
        }),
      });

      const result = await dictTableRepository.update(1, dictTableUpdate);

      expect(result).toEqual(mockDictTable);
    });

    it('should return null if dictTable not found for update', async () => {
      const dictTableUpdate: DictTableUpdate = { name: 'Updated Name' };

      (db.updateTable as Mock).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returningAll: vi.fn().mockReturnValueOnce({
              executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
            }),
          }),
        }),
      });

      const result = await dictTableRepository.update(999, dictTableUpdate);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a dictTable by ID', async () => {
      (db.deleteFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          execute: vi.fn().mockResolvedValueOnce(undefined),
        }),
      });

      await dictTableRepository.delete(1);

      expect(db.deleteFrom).toHaveBeenCalled();
    });
  });
});
