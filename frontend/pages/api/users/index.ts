// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { connectToDatabase } from '@/database/connection';
import User, { UserDocument } from '@/database/models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

interface Response {
  data?: UserDocument[];
  message?: string;
  error?: string;
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  await connectToDatabase();
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: 'Not Authorize' });

  switch (req.method) {
    case 'GET':
      const result = await User.find({
        username: { $regex: req.query.username, $options: 'i' },
        _id: { $ne: session?.user.id },
      }).limit(5);
      res.status(200).json({ data: result });
  }
}
