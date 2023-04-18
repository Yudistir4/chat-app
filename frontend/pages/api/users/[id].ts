// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { connectToDatabase } from '@/database/connection';
import User, { UserDocument } from '@/database/models/user';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await connectToDatabase();
  switch (req.method) {
    // case 'GET':
    //   const result: UserDocument | null = await User.findById(req.query.id);

    //   res.status(200).json({ });
    case 'PUT':
      let data = await User.findById(req.query.id);

      if (!data)
        return res
          .status(404)
          .json({ message: 'Update username failed', error: 'User not found' });

      data.username = req.body.username;
      await data.save();
      res.status(200).json({ message: 'Update username success' });
  }
}
