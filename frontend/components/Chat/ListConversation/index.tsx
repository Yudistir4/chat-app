import { api } from '@/config';
import { ConversationDocument } from '@/database/models/conversation';
import useConversation from '@/store/conversation';
import { Box, Button, Stack, Text, useDisclosure } from '@chakra-ui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { signOut, useSession } from 'next-auth/react';
import * as React from 'react';
import ConversationItem from './ConversationItem';
import FindConversationModal from './FindConversationModal';
import { ClientToServerEvents, Data, ServerToClientEvents } from '..';
import { Socket } from 'socket.io-client';

interface IListConversationProps {
  socket: React.RefObject<
    Socket<ServerToClientEvents, ClientToServerEvents> | undefined
  >;
}

const ListConversation: React.FunctionComponent<IListConversationProps> = ({
  socket,
}) => {
  const [arrivalMessageBackground, setArrivalMessageBackground] =
    React.useState<Data | null>(null);
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get Conversation list
  const { data: dataConversations, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
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
  const currentConversation = useConversation(
    (state) => state.currentConversation
  );

  // Receive message
  React.useEffect(() => {
    socket.current?.on('receiveMessage', (message) => {
      console.log({ messageBg: message });
      setArrivalMessageBackground(message);
    });
  }, [socket]);

  // add message to related conversation
  React.useEffect(() => {
    if (arrivalMessageBackground) {
      queryClient.setQueryData(['conversations'], (old: any) => {
        const conversationIndex: number = old.data.data.findIndex(
          (conversation: any) =>
            conversation._id === arrivalMessageBackground.conversation
        );

        if (conversationIndex >= 0) {
          let conversations = JSON.parse(JSON.stringify(old.data.data));
          const itemToMove = conversations[conversationIndex];
          conversations.splice(conversationIndex, 1);
          conversations.unshift({
            ...itemToMove,
            lastMessage: arrivalMessageBackground,
          });
          return { data: { data: conversations } };
        } else {
          refetchConversations();
        }
      });
    }
  }, [arrivalMessageBackground, queryClient, refetchConversations]);

  return (
    <Box
      width={{ base: '100%', md: '400px' }}
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
              <ConversationItem
                key={conversation._id}
                conversation={conversation}
                isOnConversation={
                  currentConversation?._id === conversation._id ? true : false
                }
              />
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
