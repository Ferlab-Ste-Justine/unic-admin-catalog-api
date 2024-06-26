import { Mock } from 'vitest';

import { AnalystUpdate, NewAnalyst } from '@/api/analyst/analystModel';
import { analystRepository } from '@/api/analyst/analystRepository';
import { mockAnalyst } from '@/api/mocks';
import { db } from '@/db';

vi.mock('@/db');

describe('analystRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all analysts with no search or sort', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        selectAll: () => ({
          execute: vi.fn().mockResolvedValueOnce([mockAnalyst]),
        }),
      });

      const result = await analystRepository.findAll();

      expect(result).toEqual([mockAnalyst]);
    });

    it('should apply search criteria', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        selectAll: () => ({
          where: vi.fn().mockReturnValueOnce({
            execute: vi.fn().mockResolvedValueOnce([mockAnalyst]),
          }),
        }),
      });

      const result = await analystRepository.findAll('name', 'John');

      expect(result).toEqual([mockAnalyst]);
    });

    it('should apply sorting', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        selectAll: () => ({
          orderBy: vi.fn().mockReturnValueOnce({
            execute: vi.fn().mockResolvedValueOnce([mockAnalyst]),
          }),
        }),
      });

      const result = await analystRepository.findAll(undefined, undefined, 'name', 'asc');

      expect(result).toEqual([mockAnalyst]);
    });
  });

  describe('findById', () => {
    it('should return an analyst by ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockAnalyst),
          }),
        }),
      });

      const result = await analystRepository.findById(1);

      expect(result).toEqual(mockAnalyst);
    });

    it('should return null if analyst not found', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await analystRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return an analyst by name', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockAnalyst),
          }),
        }),
      });

      const result = await analystRepository.findByName('John Doe');

      expect(result).toEqual(mockAnalyst);
    });

    it('should return null if analyst not found by name', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await analystRepository.findByName('Unknown');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new analyst', async () => {
      const newAnalyst: NewAnalyst = { name: 'Jane Doe', last_update: new Date() };

      (db.insertInto as Mock).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returningAll: vi.fn().mockReturnValueOnce({
            executeTakeFirstOrThrow: vi.fn().mockResolvedValueOnce(mockAnalyst),
          }),
        }),
      });

      const result = await analystRepository.create(newAnalyst);

      expect(result).toEqual(mockAnalyst);
    });
  });

  describe('update', () => {
    it('should update an analyst', async () => {
      const analystUpdate: AnalystUpdate = { name: 'John Smith' };

      (db.updateTable as Mock).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returningAll: vi.fn().mockReturnValueOnce({
              executeTakeFirst: vi.fn().mockResolvedValueOnce(mockAnalyst),
            }),
          }),
        }),
      });

      const result = await analystRepository.update(1, analystUpdate);

      expect(result).toEqual(mockAnalyst);
    });

    it('should return null if analyst not found for update', async () => {
      const analystUpdate: AnalystUpdate = { name: 'John Smith' };

      (db.updateTable as Mock).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returningAll: vi.fn().mockReturnValueOnce({
              executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
            }),
          }),
        }),
      });

      const result = await analystRepository.update(999, analystUpdate);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an analyst', async () => {
      (db.deleteFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          execute: vi.fn().mockResolvedValueOnce(undefined),
        }),
      });

      await analystRepository.delete(1);

      expect(db.deleteFrom).toHaveBeenCalled();
    });
  });
});
