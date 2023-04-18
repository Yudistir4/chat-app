import { api } from '@/config';
import { MessageDocument } from '@/database/models/message';
import useConversation from '@/store/conversation';
import { Avatar, Box, Center, Flex, Input, Text } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { Ref, useEffect, useRef, useState } from 'react';
import Message from './Message';

import { v4 as uuidv4 } from 'uuid';
import { formatDate } from '@/utils';

interface IConversationProps {}
interface Messages {
  date: string;
  messages: MessageDocument[];
}

const Conversation: React.FunctionComponent<IConversationProps> = (props) => {
  const { data: session } = useSession();
  const currentConversation = useConversation(
    (state) => state.currentConversation
  );
  const currentConversationUser = currentConversation?.participants.filter(
    (participant) => participant._id !== session?.user.id
  )[0];
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const conversationRef = useRef<HTMLDivElement>();
  // Add new message
  const { data, mutate: addMessageMutate } = useMutation({
    mutationFn: (message: {
      content: string;
      conversation: string;
      sender: string;
    }) => axios.post(api.messages, message),
  });

  // Query Message
  const { data: dataMessage } = useQuery({
    queryKey: ['message', currentConversation?._id],
    enabled: !!currentConversation,
    queryFn: () =>
      axios.get<{ data: MessageDocument[] }>(
        api.messages + '?conversation=' + currentConversation?._id
      ),
    select: (res) => {
      const data = res.data.data;
      if (data.length === 0) return [];
      const messages = data.reduce((accumulator: Messages[], current) => {
        const currentDate = formatDate(current.createdAt);
        const lastDate =
          accumulator.length > 0
            ? accumulator[accumulator.length - 1].date
            : null;
        if (currentDate === lastDate) {
          accumulator[accumulator.length - 1].messages.push(current);
        } else {
          accumulator.push({ date: currentDate, messages: [current] });
        }
        return accumulator;
      }, []);
      return messages;
    },
  });

  // Trigger scroll to bottom if message come in
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [dataMessage]);

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
      createdAt: new Date(),
    };

    // Add message to message list
    queryClient.setQueryData(
      ['message', currentConversation._id],
      (old: any) => ({ data: { data: [...old.data.data, message] } })
    );

    // add conversation to conversation list
    queryClient.setQueryData(['conversations'], (old: any) => {
      const conversationIndex: number = old.data.data.findIndex(
        (conversation: any) => conversation._id === currentConversation._id
      );

      if (conversationIndex >= 0) {
        let conversations = JSON.parse(JSON.stringify(old.data.data));
        const itemToMove = conversations[conversationIndex];
        conversations.splice(conversationIndex, 1);
        conversations.unshift({ ...itemToMove, lastMessage: message });
        return { data: { data: conversations } };
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
    <>
      {currentConversation ? (
        <Flex
          direction="column"
          width={{ base: '0', md: 'calc(100% - 400px)' }}
        >
          {/* Header */}
          <Flex alignItems="center" gap={3} py={2} px={4} bg="whiteAlpha.200">
            <Avatar src={currentConversationUser?.image} />
            <Text fontWeight={500}>{currentConversationUser?.username}</Text>
          </Flex>

          <Flex
            ref={conversationRef as Ref<HTMLDivElement>}
            flexGrow="1"
            overflowY="auto"
            px={3}
            direction="column"
            pt={2}
          >
            {/* Message */}
            {dataMessage &&
              dataMessage.map(({ date, messages }: Messages) => {
                return (
                  <Flex direction="column" gap={2} key={date}>
                    <Center>
                      <Text bg="whiteAlpha.100" px={4} py={1} borderRadius="xl">
                        {date}
                      </Text>
                    </Center>
                    {messages.map((message) => (
                      <Message
                        key={message._id}
                        message={message}
                        isOwn={message.sender === session?.user.id}
                      />
                    ))}
                  </Flex>
                );
              })}
          </Flex>

          {/* Input */}
          <Box p={3}>
            <form onSubmit={onSubmit}>
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write message"
              />
            </form>
          </Box>
        </Flex>
      ) : (
        <Center width={{ base: '0', md: 'calc(100% - 400px)' }}>
          <Text fontSize="3xl">Lets Start Conversation </Text>
        </Center>
      )}
    </>
  );
};

export default Conversation;
