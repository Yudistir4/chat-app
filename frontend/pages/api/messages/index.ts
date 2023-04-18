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
    case 'GET':
      console.table(req.query);

      let messages = await Message.find({
        conversation: req.query.conversation,
      }).sort({ createdAt: 1 });

      return res.status(200).json({ data: messages });
    case 'POST':
      let message = new Message(req.body);
      message = await message.save();
      console.log({ message: req.body });
      const result = await Conversation.findByIdAndUpdate(
        req.body.conversation,
        {
          lastMessage: message._id,
        },
        { new: true }
      );
      console.log({ result });
      res.status(200).json({ data: message });
  }
}
