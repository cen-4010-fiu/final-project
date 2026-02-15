import { OpenAPIHono } from '@hono/zod-openapi';
import users from './users/routes';

const app = new OpenAPIHono();

app.route('/users', users);

export default app;
