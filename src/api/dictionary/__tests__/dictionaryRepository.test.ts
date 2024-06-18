import { Mock } from 'vitest'; // Adjust the import path as needed

import { DictionaryUpdate, NewDictionary } from '@/api/dictionary/dictionaryModel';
import { mockDictionary } from '@/api/mocks'; // You need to create this mock if it doesn't exist
import { db } from '@/db';

import { dictionaryRepository } from '../dictionaryRepository';

vi.mock('@/db'); // Mock the db module

describe('dictionaryRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mock calls between tests
  });

  describe('findAll', () => {
    it('should return all dictionaries', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        selectAll: vi.fn().mockReturnValueOnce({
          execute: vi.fn().mockResolvedValueOnce([mockDictionary]),
        }),
      });

      const result = await dictionaryRepository.findAll();

      expect(result).toEqual([mockDictionary]);
    });
  });

  describe('findById', () => {
    it('should return a dictionary by ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockDictionary),
          }),
        }),
      });

      const result = await dictionaryRepository.findById(1);

      expect(result).toEqual(mockDictionary);
    });

    it('should return null if dictionary not found', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await dictionaryRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByResourceId', () => {
    it('should return a dictionary by resource ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockDictionary),
          }),
        }),
      });

      const result = await dictionaryRepository.findByResourceId(1);

      expect(result).toEqual(mockDictionary);
    });

    it('should return null if dictionary not found by resource ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await dictionaryRepository.findByResourceId(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new dictionary', async () => {
      const newDictionary: NewDictionary = { ...mockDictionary, resource_id: 2 };

      (db.insertInto as Mock).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returningAll: vi.fn().mockReturnValueOnce({
            executeTakeFirstOrThrow: vi.fn().mockResolvedValueOnce(mockDictionary),
          }),
        }),
      });

      const result = await dictionaryRepository.create(newDictionary);

      expect(result).toEqual(mockDictionary);
    });
  });

  describe('update', () => {
    it('should update a dictionary', async () => {
      const dictionaryUpdate: DictionaryUpdate = {
        ...mockDictionary,
        to_be_published: !mockDictionary.to_be_published,
      };

      (db.updateTable as Mock).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returningAll: vi.fn().mockReturnValueOnce({
              executeTakeFirst: vi.fn().mockResolvedValueOnce(mockDictionary),
            }),
          }),
        }),
      });

      const result = await dictionaryRepository.update(1, dictionaryUpdate);

      expect(result).toEqual(mockDictionary);
    });

    it('should return null if dictionary not found for update', async () => {
      const dictionaryUpdate: DictionaryUpdate = {
        ...mockDictionary,
        to_be_published: !mockDictionary.to_be_published,
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

      const result = await dictionaryRepository.update(999, dictionaryUpdate);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a dictionary', async () => {
      (db.deleteFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          execute: vi.fn().mockResolvedValueOnce(undefined),
        }),
      });

      await dictionaryRepository.delete(1);

      expect(db.deleteFrom).toHaveBeenCalled();
    });
  });
});
