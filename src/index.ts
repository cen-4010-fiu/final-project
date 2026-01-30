import { createApp } from './app';

const app = createApp();
const port = Number(process.env.PORT) || 3000;

// console.log(`Server: http://localhost:${port}`);
// console.log(`Docs:   http://localhost:${port}/docs`);

export default {
  port,
  fetch: app.fetch,
};
