import { OpenAPIHono } from '@hono/zod-openapi';
import books from './books/routes';
import comments from './comments/routes';
import ratings from './ratings/routes';
import users from './users/routes';
import shoppingCart from './shoppingCart/routes';

const app = new OpenAPIHono();

app.route('/users', users);
app.route('/books', books);
app.route('/shopping-cart', shoppingCart);
app.route('/ratings', ratings);
app.route('/comments', comments);

export default app;
