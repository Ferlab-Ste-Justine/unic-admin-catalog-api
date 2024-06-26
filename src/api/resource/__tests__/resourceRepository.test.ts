import { Mock } from 'vitest';

import { mockResource } from '@/api/mocks';
import { NewResource, ResourceUpdate } from '@/api/resource/resourceModel';
import { resourceRepository } from '@/api/resource/resourceRepository';
import { db } from '@/db';

vi.mock('@/db');

describe('resourceRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all resources with no search or sort', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        leftJoin: () => ({
          selectAll: () => ({
            select: () => ({
              execute: vi.fn().mockResolvedValueOnce([mockResource]),
            }),
          }),
        }),
      });

      const result = await resourceRepository.findAll();

      expect(result).toEqual([mockResource]);
    });

    it('should apply search criteria', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        leftJoin: () => ({
          selectAll: () => ({
            select: () => ({
              where: vi.fn().mockReturnValueOnce({
                execute: vi.fn().mockResolvedValueOnce([mockResource]),
              }),
            }),
          }),
        }),
      });

      const result = await resourceRepository.findAll('name', 'John');

      expect(result).toEqual([mockResource]);
    });

    it('should apply sorting', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        leftJoin: () => ({
          selectAll: () => ({
            select: () => ({
              orderBy: vi.fn().mockReturnValueOnce({
                execute: vi.fn().mockResolvedValueOnce([mockResource]),
              }),
            }),
          }),
        }),
      });

      const result = await resourceRepository.findAll(undefined, undefined, 'name', 'asc');

      expect(result).toEqual([mockResource]);
    });
  });

  describe('findById', () => {
    it('should return a resource by ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        leftJoin: () => ({
          selectAll: () => ({
            select: () => ({
              where: vi.fn().mockReturnValueOnce({
                executeTakeFirst: vi.fn().mockResolvedValueOnce(mockResource),
              }),
            }),
          }),
        }),
      });

      const result = await resourceRepository.findById(1);

      expect(result).toEqual(mockResource);
    });

    it('should return null if resource not found by ID', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        leftJoin: () => ({
          selectAll: () => ({
            select: () => ({
              where: vi.fn().mockReturnValueOnce({
                executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
              }),
            }),
          }),
        }),
      });

      const result = await resourceRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByCode', () => {
    it('should return a resource by code', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(mockResource),
          }),
        }),
      });

      const result = await resourceRepository.findByCode('sample_code');

      expect(result).toEqual(mockResource);
    });

    it('should return null if resource not found by code', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await resourceRepository.findByCode('unknown_code');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new resource', async () => {
      const newResource: NewResource = {
        ...mockResource,
        name: 'New Resource',
        code: 'new_code',
        last_update: new Date(),
      };

      (db.insertInto as Mock).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returningAll: vi.fn().mockReturnValueOnce({
            executeTakeFirstOrThrow: vi.fn().mockResolvedValueOnce(mockResource),
          }),
        }),
      });

      const result = await resourceRepository.create(newResource);

      expect(result).toEqual(mockResource);
    });
  });

  describe('update', () => {
    it('should update an existing resource', async () => {
      const resourceUpdate: ResourceUpdate = { name: 'Updated Name' };

      (db.updateTable as Mock).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returningAll: vi.fn().mockReturnValueOnce({
              executeTakeFirst: vi.fn().mockResolvedValueOnce(mockResource),
            }),
          }),
        }),
      });

      const result = await resourceRepository.update(1, resourceUpdate);

      expect(result).toEqual(mockResource);
    });

    it('should return null if resource not found for update', async () => {
      const resourceUpdate: ResourceUpdate = { name: 'Updated Name' };

      (db.updateTable as Mock).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returningAll: vi.fn().mockReturnValueOnce({
              executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
            }),
          }),
        }),
      });

      const result = await resourceRepository.update(999, resourceUpdate);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a resource by ID', async () => {
      (db.deleteFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          execute: vi.fn().mockResolvedValueOnce(undefined),
        }),
      });

      await resourceRepository.delete(1);

      expect(db.deleteFrom).toHaveBeenCalled();
    });
  });
});
