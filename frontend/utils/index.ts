import { Session } from 'next-auth';
import { ConversationDocument } from '@/database/models/conversation';
import { UserDocument } from '@/database/models/user';

export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const getConversationUser = (
  conversation: ConversationDocument | null,
  session: Session | null
): UserDocument | undefined => {
  return conversation?.participants.filter(
    (participant) => participant._id !== session?.user.id
  )[0];
};
