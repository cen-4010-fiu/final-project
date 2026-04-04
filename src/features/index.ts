import { OpenAPIHono } from '@hono/zod-openapi';
import books from './books/routes';
import comments from './comments/routes';
import purchases from './purchases/routes';
import ratings from './ratings/routes';
import users from './users/routes';

const app = new OpenAPIHono();

app.route('/users', users);
app.route('/books', books);
app.route('/ratings', ratings);
app.route('/comments', comments);
app.route('/purchases', purchases);

export default app;
