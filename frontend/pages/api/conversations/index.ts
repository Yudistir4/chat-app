import { connectToDatabase } from '@/database/connection';
import Conversation, {
  ConversationDocument,
} from '@/database/models/conversation';
import Message, { MessageDocument } from '@/database/models/message';
import { UserDocument } from '@/database/models/user';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { getCsrfToken, getSession } from 'next-auth/react';

interface Response {
  data?: any;
  message?: string;
  error?: string;
}

interface GetConversationsResponse {
  _id: string;
  participants: UserDocument[];
  lastMessage: MessageDocument['_id'] | null | MessageDocument;
  unReadMessages: number;
  createdAt: Date;
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

      let results: GetConversationsResponse[] = [];
      for (let i = 0; i < conversations.length; i++) {
        const conversation = conversations[i]._id;

        console.log(conversations[i].toObject());
        const sender = conversations[i].participants.filter(
          (p) => p.id !== session?.user.id
        );

        const count = await Message.count({
          isRead: false,
          conversation,
          sender,
        });
        results[i] = {
          ...conversations[i].toObject(),
          unReadMessages: count,
        } as GetConversationsResponse;
      }

      console.log({ results });
      return res.status(200).json({ data: results });

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
