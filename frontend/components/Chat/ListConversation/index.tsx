import {
  Box,
  Button,
  Flex,
  Input,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { signOut, useSession } from 'next-auth/react';
import * as React from 'react';
import FindConversationModal from './FindConversationModal';
import ConversationItem from './ConversationItem';
import UserItem from './UserItem';
import axios, { AxiosResponse } from 'axios';
import { api } from '@/config';
import { useQuery } from '@tanstack/react-query';
import { ConversationDocument } from '@/database/models/conversation';
import useConversation from '@/store/conversation';

interface IListConversationProps {}

const ListConversation: React.FunctionComponent<IListConversationProps> = (
  props
) => {
  const { data: session } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: dataConversations } = useQuery({
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
  console.log({ dataConversations });
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
