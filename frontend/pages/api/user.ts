// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { connectToDatabase } from '@/database/connection';
import UserModel from '@/database/models/user';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  switch (req.method) {
    case 'GET':
      const db = await connectToDatabase();

      const result = await UserModel.find();
      console.log(result);
      res.status(200).json({ name: result[0].name });
  }
}
