import { connectToDatabase } from '@/database/connection';
import Conversation, {
  ConversationDocument,
} from '@/database/models/conversation';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { getCsrfToken, getSession } from 'next-auth/react';

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
  // if (!session) return res.status(401).json({ message: 'Not Authorize' });

  switch (req.method) {
    case 'GET':
      const session = await getSession({ req });

      let conversations = await Conversation.find({
        participants: { $in: [session?.user.id] },
        lastMessage: { $ne: null },
      })
        .populate('lastMessage')
        .populate('participants')
        .sort({ updatedAt: -1 });

      return res.status(200).json({ data: conversations });

    case 'POST':
      let conversation = await Conversation.findOne({
        participants: { $all: req.body.participants },
      }).populate('participants');
      if (conversation)
        return res
          .status(200)
          .json({ data: conversation, message: 'already created' });
      conversation = new Conversation({
        participants: req.body.participants,
      });
      conversation = await conversation.save();

      conversation = await Conversation.findById(conversation._id).populate(
        'participants'
      );

      res.status(200).json({ data: conversation });
  }
}
