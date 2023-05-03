import { connectToDatabase } from '@/database/connection';
import Conversation from '@/database/models/conversation';
import Message from '@/database/models/message';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

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

  // const session = await getSession({ req });
  // if (!session) return res.status(401).json({ message: 'Not authenticated' });
  // console.log({ session });
  switch (req.method) {
    case 'PUT':
      console.log(req.query);
      const message = await Message.findByIdAndUpdate(
        req.query.id,
        {
          isRead: true,
        },
        { new: true }
      );

      res.status(200).json({ data: message });
  }
}
