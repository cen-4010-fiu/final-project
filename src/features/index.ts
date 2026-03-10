import { OpenAPIHono } from '@hono/zod-openapi';
import users from './users/routes';
import books from './books/routes';

const app = new OpenAPIHono();

app.route('/users', users);
app.route('/books', books);

export default app;