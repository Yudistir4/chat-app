import { api } from '@/config';
import { MessageDocument } from '@/database/models/message';
import useConversation from '@/store/conversation';
import { Avatar, Box, Center, Flex, Input, Text } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { Ref, RefObject, useEffect, useRef, useState } from 'react';
import Message from './Message';

import { v4 as uuidv4 } from 'uuid';
import { formatDate } from '@/utils';
import Header from './Header';
import { Socket } from 'socket.io-client';
import { ClientToServerEvents, Data, ServerToClientEvents } from '../index';
import InputMessage from './InputMessage';

interface IConversationProps {
  socket: RefObject<
    Socket<ServerToClientEvents, ClientToServerEvents> | undefined
  >;
}
interface Messages {
  date: string;
  messages: MessageDocument[];
}

const Conversation: React.FunctionComponent<IConversationProps> = ({
  socket,
}) => {
  console.log('relex');

  const { data: session } = useSession();
  const currentConversation = useConversation(
    (state) => state.currentConversation
  );
  const currentConversationUser = currentConversation?.participants.filter(
    (participant) => participant._id !== session?.user.id
  )[0];

  const [arrivalMessage, setArrivalMessage] = useState<Data | null>(null);

  const queryClient = useQueryClient();
  const conversationRef = useRef<HTMLDivElement>();
  // Add new message

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

  useEffect(() => {
    socket.current?.on('receiveMessage', (message) => {
      console.log({ message });

      setArrivalMessage(message);
    });
  }, [socket]);

  useEffect(() => {
    if (
      arrivalMessage &&
      currentConversation &&
      currentConversation._id === arrivalMessage.conversation &&
      queryClient.getQueryData(['message', currentConversation._id])
    ) {
      queryClient.setQueryData(
        ['message', currentConversation._id],
        (old: any) => ({ data: { data: [...old.data.data, arrivalMessage] } })
      );
      // setArrivalMessage(null);
    }
  }, [arrivalMessage, queryClient, currentConversation]);

  // Trigger scroll to bottom if message come in
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [dataMessage]);

  return (
    <>
      {currentConversation ? (
        <Flex
          direction="column"
          width={{ base: '0', md: 'calc(100% - 400px)' }}
        >
          {/* Header */}
          <Header currentConversationUser={currentConversationUser} />

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
          <InputMessage
            currentConversation={currentConversation}
            currentConversationUser={currentConversationUser}
            session={session}
            socket={socket}
          />
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
