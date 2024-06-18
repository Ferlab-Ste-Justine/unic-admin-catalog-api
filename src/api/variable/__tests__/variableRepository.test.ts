import { Mock } from 'vitest'; // Adjust the import path as needed

import { mockVariable } from '@/api/mocks';
import { NewVariable, VariableUpdate } from '@/api/variable/variableModel';
import { db } from '@/db';

import { variableRepository } from '../variableRepository';

vi.mock('@/db'); // Mock the db module

describe('variableRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mock calls between tests
  });

  describe('findAll', () => {
    it('should return all variables with no search or sort', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        leftJoin: vi.fn().mockReturnThis(),
        selectAll: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnValueOnce({
          execute: vi.fn().mockResolvedValueOnce([mockVariable]),
        }),
      });

      const result = await variableRepository.findAll();

      expect(result).toEqual([mockVariable]);
    });

    it('should apply search criteria', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        leftJoin: vi.fn().mockReturnThis(),
        selectAll: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            execute: vi.fn().mockResolvedValueOnce([mockVariable]),
          }),
        }),
      });

      const result = await variableRepository.findAll('name', 'John');

      expect(result).toEqual([mockVariable]);
    });

    it('should apply sorting', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        leftJoin: vi.fn().mockReturnThis(),
        selectAll: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnValueOnce({
          orderBy: vi.fn().mockReturnValueOnce({
            execute: vi.fn().mockResolvedValueOnce([mockVariable]),
          }),
        }),
      });

      const result = await variableRepository.findAll(undefined, undefined, 'name', 'asc');

      expect(result).toEqual([mockVariable]);
    });
  });

  describe('findById', () => {
    it('should return a variable by ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        leftJoin: vi.fn().mockReturnThis(),
        selectAll: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockVariable),
          }),
        }),
      });

      const result = await variableRepository.findById(1);

      expect(result).toEqual(mockVariable);
    });

    it('should return null if variable not found by ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        leftJoin: vi.fn().mockReturnThis(),
        selectAll: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await variableRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByPath', () => {
    it('should return a variable by path', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockVariable),
          }),
        }),
      });

      const result = await variableRepository.findByPath('sample_path');

      expect(result).toEqual(mockVariable);
    });

    it('should return null if variable not found by path', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await variableRepository.findByPath('unknown_path');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new variable', async () => {
      const newVariable: NewVariable = {
        ...mockVariable,
        name: 'New Variable',
        path: 'new_path',
        last_update: new Date(),
      };

      (db.insertInto as Mock).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returningAll: vi.fn().mockReturnValueOnce({
            executeTakeFirstOrThrow: vi.fn().mockResolvedValueOnce(mockVariable),
          }),
        }),
      });

      const result = await variableRepository.create(newVariable);

      expect(result).toEqual(mockVariable);
    });
  });

  describe('update', () => {
    it('should update an existing variable', async () => {
      const variableUpdate: VariableUpdate = { name: 'Updated Name' };

      (db.updateTable as Mock).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returningAll: vi.fn().mockReturnValueOnce({
              executeTakeFirst: vi.fn().mockResolvedValueOnce(mockVariable),
            }),
          }),
        }),
      });

      const result = await variableRepository.update(1, variableUpdate);

      expect(result).toEqual(mockVariable);
    });

    it('should return null if variable not found for update', async () => {
      const variableUpdate: VariableUpdate = { name: 'Updated Name' };

      (db.updateTable as Mock).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returningAll: vi.fn().mockReturnValueOnce({
              executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
            }),
          }),
        }),
      });

      const result = await variableRepository.update(999, variableUpdate);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a variable by ID', async () => {
      (db.deleteFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          execute: vi.fn().mockResolvedValueOnce(undefined),
        }),
      });

      await variableRepository.delete(1);

      expect(db.deleteFrom).toHaveBeenCalled();
    });
  });
});
