import express from 'express';
import { BookRouter } from './routes/api/book.js';
import { UserRouter } from './routes/api/user.js';
import * as dotenv from 'dotenv';
dotenv.config();
import * as dbModule from './database.js';

import debug from 'debug';
const debugServer = debug('app:Server');

dbModule.connect();

const app = express();

app.use(express.urlencoded({extended: true}));
app.use('/api/books', BookRouter);
app.use('/api/users', UserRouter);

app.use((req, res) => {
  res.status(404).json({error: `Sorry couldn't find ${req.originalUrl}`});
});

app.use((err, req, res, next) => {
  debugServer(err.stack);
  res.status(500).json({error: err.stack});
});

app.get('/', (req, res) => {
  res.send('Hello From Amazon.com!');
  debugServer('Hello From The Upgraded console.log()!');
});

const port = process.env.PORT || 3005;

app.listen(port, ()=> {
  debugServer(` Server is listening on http://localhost:${port}`);
}); 