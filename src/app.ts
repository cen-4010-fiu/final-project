import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { requestId } from 'hono/request-id';
import { timeout } from 'hono/timeout';
import features from '@/features';
import { errorHandler } from '@/shared/middleware/error-handler';
import { notFoundHandler } from '@/shared/middleware/not-found';

export function createApp() {
  const app = new OpenAPIHono();

  app.use(logger());
  app.use(prettyJSON());
  app.use(requestId());
  app.use(timeout(15 * 1000));

  app.get('/health', (c) => c.json({ status: 'ok' }));

  // Group all feature routes under `/api`
  app.route('/api', features);

  // Holds our openapi json spec
  app.doc('/openapi.json', {
    openapi: '3.1.0',
    info: {
      title: 'CEN 4010 Final Project',
      version: '1.0.0',
    },
  });

  // Loads Scalar ui for our API
  app.get(
    '/docs',
    Scalar({
      url: '/openapi.json',
      theme: 'kepler',
    })
  );

  app.onError(errorHandler);
  app.notFound(notFoundHandler);

  return app;
}
