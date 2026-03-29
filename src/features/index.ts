import { OpenAPIHono } from '@hono/zod-openapi';
import books from './books/routes';
import users from './users/routes';

const app = new OpenAPIHono();

app.route('/users', users);
app.route('/books', books);

export default app;
