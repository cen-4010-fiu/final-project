import { OpenAPIHono } from '@hono/zod-openapi';
import books from './books/routes';
import comments from './comments/routes';
import ratings from './ratings/routes';
import users from './users/routes';
import wishlists from './wishlists/routes';

const app = new OpenAPIHono();

app.route('/users', users);
app.route('/books', books);
app.route('/ratings', ratings);
app.route('/comments', comments);
app.route('/wishlists', wishlists);

export default app;
