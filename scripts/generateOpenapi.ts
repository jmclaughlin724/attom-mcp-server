import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { openApiRegistry } from '../src/openapiRegistry';
import YAML from 'yaml';

(async () => {
  const generator = new OpenApiGeneratorV31(openApiRegistry.definitions);
  const document = generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'ATTOM MCP API',
      version: '1.0.0',
      description: 'OpenAPI schema for ATTOM MCP server',
    },
  });

  const outputPath = resolve(process.cwd(), 'openapi', 'attom-api-schema.yaml');
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, YAML.stringify(document), 'utf8');
  // eslint-disable-next-line no-console
  console.log(`✅ OpenAPI schema generated at ${outputPath}`);
})();
