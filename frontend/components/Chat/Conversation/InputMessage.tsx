import { api } from '@/config';
import { ConversationDocument } from '@/database/models/conversation';
import { UserDocument } from '@/database/models/user';
import { Box, Input } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Session } from 'next-auth';
import { RefObject, useState } from 'react';
import { Socket } from 'socket.io-client';

import { v4 as uuidv4 } from 'uuid';
import { ClientToServerEvents, ServerToClientEvents } from '../../../typing';

interface IInputMessageProps {
  session: Session | null;
  currentConversation: ConversationDocument | null;
  currentConversationUser: UserDocument | undefined;
  socket: RefObject<
    Socket<ServerToClientEvents, ClientToServerEvents> | undefined
  >;
}

const InputMessage: React.FunctionComponent<IInputMessageProps> = ({
  session,
  currentConversation,
  currentConversationUser,
  socket,
}) => {
  console.log('--input--');
  const [content, setContent] = useState('');
  const { mutate: addMessageMutate } = useMutation({
    mutationFn: (message: {
      content: string;
      conversation: string;
      sender: string;
    }) => axios.post(api.messages, message),
  });
  const queryClient = useQueryClient();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session || !currentConversation || !content) return;

    addMessageMutate({
      content,
      conversation: currentConversation._id,
      sender: session.user.id,
    });

    // add message
    const message = {
      _id: uuidv4(),
      content,
      conversation: currentConversation._id,
      sender: session.user.id,
      receiver: currentConversationUser?._id,
      createdAt: new Date(),
    };

    socket.current?.emit('sendMessage', message);

    // Add message to message list
    queryClient.setQueryData(
      ['message', currentConversation._id],
      (old: any) => ({ data: { data: [...old.data.data, message] } })
    );

    // add message to lastMessage conversation list
    queryClient.setQueryData(['conversations'], (old: any) => {
      const conversationIndex: number = old.data.data.findIndex(
        (conversation: any) => conversation._id === currentConversation._id
      );

      const updateLastMessage = (old: any, lastMessage: any): any => {
        let conversations = JSON.parse(JSON.stringify(old.data.data));
        const itemToMove = conversations[conversationIndex];
        conversations.splice(conversationIndex, 1);
        conversations.unshift({ ...itemToMove, lastMessage });
        return conversations;
      };

      if (conversationIndex >= 0) {
        return { data: { data: updateLastMessage(old, message) } };
      } else {
        return {
          data: {
            data: [
              { ...currentConversation, lastMessage: message },
              ...old.data.data,
            ],
          },
        };
      }
    });

    setContent('');
  };
  return (
    <Box p={3}>
      <form onSubmit={onSubmit}>
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write message"
        />
      </form>
    </Box>
  );
};

export default InputMessage;
