import { OpenAPIHono } from '@hono/zod-openapi';
import todos from './todos/routes';

const app = new OpenAPIHono();

app.route('/todos', todos);

export default app;
