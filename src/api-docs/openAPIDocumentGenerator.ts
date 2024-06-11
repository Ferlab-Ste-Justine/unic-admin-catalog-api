import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { analystRegistry } from '@/api/analyst/analystRouter';
import { healthCheckRegistry } from '@/api/healthCheck/healthCheckRouter';
import { resourceRegistry } from '@/api/resource/resourceRouter';
import { userRegistry } from '@/api/user/userRouter';
import { valueSetRegistry } from '@/api/valueSet/valueSetRouter';

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([
    healthCheckRegistry,
    userRegistry,
    analystRegistry,
    resourceRegistry,
    valueSetRegistry,
  ]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Swagger API',
    },
    externalDocs: {
      description: 'View the raw OpenAPI Specification in JSON format',
      url: '/swagger.json',
    },
  });
}
