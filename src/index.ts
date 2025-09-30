import app from './app';
import { ENV } from './config/env';
import { db } from './middlewares/db';

// Connect to the database before starting the server

db()
  .then(() => {
    console.log('Database connection established');
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1); // Exit the process with an error code
  });

app.listen(ENV.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${ENV.PORT} in ${ENV.NODE_ENV} mode`);
});
