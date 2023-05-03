// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { connectToDatabase } from '@/database/connection';
import type { NextApiRequest, NextApiResponse } from 'next';

interface Response {
  data?: any;
  message?: string;
  error?: string;
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  await connectToDatabase();
  switch (req.method) {
    case 'GET':
      res.status(200).json({ data: 'Server Ok ' });
  }
}
