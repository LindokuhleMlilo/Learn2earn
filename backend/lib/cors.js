// lib/cors.js
import Cors from 'cors';

const cors = Cors({
  methods: ['GET', 'POST'],
  origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
});

export function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default cors;