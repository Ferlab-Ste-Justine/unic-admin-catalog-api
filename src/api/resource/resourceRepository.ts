import pool from '../../db';
import { Resource } from './resourceModel';

export const resourceRepository = {
  findAllResources: async (name?: string): Promise<Resource[]> => {
    let query = `SELECT *
                     FROM catalog.resource`;
    const values: any[] = [];

    if (name) {
      query += ` WHERE name ILIKE $1`;
      values.push(`%${name}%`);
    }

    const res = await pool.query(query, values);
    return res.rows;
  },

  findResourceById: async (id: number): Promise<Resource | null> => {
    const query = `SELECT *
                       FROM catalog.resource
                       WHERE id = $1`;
    const res = await pool.query(query, [id]);
    return res.rows[0] || null;
  },

  createResource: async (resource: Omit<Resource, 'id' | 'last_update'>): Promise<Resource> => {
    const query = `
            INSERT INTO catalog.resource (code,
                                          name,
                                          title,
                                          resource_type,
                                          description_en,
                                          description_fr,
                                          principal_investigator,
                                          erb_project_id,
                                          project_creation_date,
                                          project_active,
                                          project_status,
                                          project_approved,
                                          project_folder,
                                          project_approval_date,
                                          project_completion_date,
                                          to_be_published,
                                          system_database_type,
                                          analyst_id,
                                          system_collection_starting_year,
                                          last_update)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
                    NOW()) RETURNING id, last_update, code, name, title, resource_type, description_en, description_fr, principal_investigator, erb_project_id, project_creation_date, project_active, project_status, project_approved, project_folder, project_approval_date, project_completion_date, to_be_published, system_database_type, analyst_id, system_collection_starting_year;
        `;

    const values = [
      resource.code,
      resource.name,
      resource.title,
      resource.resource_type,
      resource.description_en,
      resource.description_fr,
      resource.principal_investigator,
      resource.erb_project_id,
      resource.project_creation_date,
      resource.project_active,
      resource.project_status,
      resource.project_approved,
      resource.project_folder,
      resource.project_approval_date,
      resource.project_completion_date,
      resource.to_be_published,
      resource.system_database_type,
      resource.analyst_id,
      resource.system_collection_starting_year,
    ];

    const res = await pool.query(query, values);
    return res.rows[0];
  },

  updateResource: async (id: number, resource: Omit<Resource, 'id' | 'last_update'>): Promise<Resource | null> => {
    const {
      code,
      name,
      title,
      resource_type,
      description_en,
      description_fr,
      principal_investigator,
      erb_project_id,
      project_creation_date,
      project_active,
      project_status,
      project_approved,
      project_folder,
      project_approval_date,
      project_completion_date,
      to_be_published,
      system_database_type,
      analyst_id,
      system_collection_starting_year,
    } = resource;
    const query = `
            UPDATE catalog.resource
            SET code                            = $1,
                name                            = $2,
                title                           = $3,
                resource_type                   = $4,
                description_en                  = $5,
                description_fr                  = $6,
                principal_investigator          = $7,
                erb_project_id                  = $8,
                project_creation_date           = $9,
                project_active                  = $10,
                project_status                  = $11,
                project_approved                = $12,
                project_folder                  = $13,
                project_approval_date           = $14,
                project_completion_date         = $15,
                to_be_published                 = $16,
                system_database_type            = $17,
                analyst_id                      = $18,
                system_collection_starting_year = $19,
                last_update                     = NOW()
            WHERE id = $20 RETURNING *;
        `;
    const values = [
      code,
      name,
      title,
      resource_type,
      description_en,
      description_fr,
      principal_investigator,
      erb_project_id,
      project_creation_date,
      project_active,
      project_status,
      project_approved,
      project_folder,
      project_approval_date,
      project_completion_date,
      to_be_published,
      system_database_type,
      analyst_id,
      system_collection_starting_year,
      id,
    ];
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  },

  deleteResource: async (id: number): Promise<void> => {
    const query = `DELETE
                       FROM catalog.resource
                       WHERE id = $1`;
    await pool.query(query, [id]);
  },
};
