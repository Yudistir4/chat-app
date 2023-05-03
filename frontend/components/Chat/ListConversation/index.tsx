import { api } from '@/config';
import { ConversationDocument } from '@/database/models/conversation';
import useConversation from '@/store/conversation';
import { getConversationUser } from '@/utils';
import { Box, Button, Stack, Text, useDisclosure } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { signOut, useSession } from 'next-auth/react';
import * as React from 'react';
import { Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  MessageData,
  ServerToClientEvents,
} from '../../../typing';
import ConversationItem from './ConversationItem';
import FindConversationModal from './FindConversationModal';

interface IListConversationProps {
  socket: React.RefObject<
    Socket<ServerToClientEvents, ClientToServerEvents> | undefined
  >;
}

const ListConversation: React.FunctionComponent<IListConversationProps> = ({
  socket,
}) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentConversation = useConversation(
    (state) => state.currentConversation
  );

  // Get Conversation list
  const { data: dataConversations, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    refetchOnWindowFocus: false,
    queryFn: () =>
      axios.get<{ data: ConversationDocument[] }>(api.conversations),
    select(res) {
      return res.data.data.map((conversation) => {
        return {
          ...conversation,
          participants: conversation.participants.filter(
            (user) => user._id !== session?.user.id
          ),
        };
      }) as ConversationDocument[];
    },
  });

  // Mark as read all messages DB
  const { mutate: updateIsReadMessage } = useMutation({
    mutationFn: (data: { sender: string; conversation: string }) =>
      axios.put(`${api.messages}`, data),
  });

  React.useEffect(() => {
    function onReceive(message: MessageData) {
      console.log({ messageBg: message });
      queryClient.setQueryData(['conversations'], (old: any) => {
        const conversationIndex: number = old.data.data.findIndex(
          (conversation: any) => conversation._id === message.conversation
        );

        if (conversationIndex >= 0) {
          let conversations = JSON.parse(JSON.stringify(old.data.data));
          const itemToMove = conversations[conversationIndex];
          if (currentConversation?._id !== itemToMove._id) {
            itemToMove.unReadMessages++;
          }
          conversations.splice(conversationIndex, 1);
          conversations.unshift({ ...itemToMove, lastMessage: message });
          return { data: { data: conversations } };
        } else {
          refetchConversations();
        }
      });
    }
    const mySocket = socket.current;
    mySocket?.on('receiveMessage', onReceive);
    return () => {
      mySocket?.off('receiveMessage', onReceive);
    };
  }, [socket, currentConversation, queryClient, refetchConversations]);

  const onClickConversationItem = (conversation: ConversationDocument) => {
    if (!socket.current || conversation.unReadMessages === 0) return;
    const sender = getConversationUser(conversation, session)?._id;
    const conversationID: string = conversation._id;
    updateIsReadMessage({ sender, conversation: conversationID });

    // emit mark as read message
    socket.current.emit('markAsRead', { sender, conversation: conversationID });

    // update unReadMessage=0
    queryClient.setQueryData(['conversations'], (old: any) => {
      const conversationIndex: number = old.data.data.findIndex(
        (conversation: any) => conversation._id === conversationID
      );
      old.data.data[conversationIndex].unReadMessages = 0;
      return old;
    });
  };
  return (
    <Box
      display={{ sm: currentConversation ? 'none' : 'block', md: 'block' }}
      width={{ sm: currentConversation ? '0' : '100%', md: '50%', lg: '400px' }}
      py={2}
      px={4}
      bg="whiteAlpha.50"
      position="relative"
    >
      <Stack height="full">
        <Box
          onClick={onOpen}
          bg="blackAlpha.300"
          cursor="pointer"
          p={2}
          borderRadius={4}
          flexShrink={0}
        >
          <Text textAlign="center" fontWeight={500} color="whiteAlpha.800">
            Find or start conversation
          </Text>
        </Box>
        <Stack flexGrow="1" overflowY="auto">
          {dataConversations &&
            dataConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => onClickConversationItem(conversation)}
              >
                <ConversationItem
                  conversation={conversation}
                  isOnConversation={
                    currentConversation?._id === conversation._id ? true : false
                  }
                />
              </div>
            ))}
        </Stack>
        <Button flexShrink="0" onClick={() => signOut()}>
          Logout
        </Button>
      </Stack>
      <FindConversationModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default ListConversation;
