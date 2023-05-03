import { api } from '@/config';
import { MessageDocument } from '@/database/models/message';
import useConversation from '@/store/conversation';
import { Center, Flex, Text } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { Ref, RefObject, useEffect, useRef } from 'react';
import Message from './Message';

import { formatDate, getConversationUser } from '@/utils';
import { Socket } from 'socket.io-client';
import {
  AsReadPayload,
  ClientToServerEvents,
  MessageData,
  ServerToClientEvents,
} from '../../../typing';
import Header from './Header';
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
  console.log('conversation');

  const { data: session } = useSession();
  const currentConversation = useConversation(
    (state) => state.currentConversation
  );
  const currentConversationUser = getConversationUser(
    currentConversation,
    session
  );

  const queryClient = useQueryClient();
  const conversationRef = useRef<HTMLDivElement>();

  // Query Messages
  const { data: dataMessage } = useQuery({
    queryKey: ['message', currentConversation?._id],
    enabled: !!currentConversation,
    refetchOnWindowFocus: false,

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

  // Update all isRead Message
  const { mutate: updateIsReadMessage } = useMutation({
    mutationFn: (data: { sender: string; conversation: string }) =>
      axios.put(`${api.messages}`, data),
  });

  useEffect(() => {
    const mySocket = socket.current;
    function onReceiveMessage(message: MessageData) {
      console.log({ message });
      const { sender, conversation } = message;

      if (queryClient.getQueryData(['message', message.conversation])) {
        queryClient.setQueryData(
          ['message', message.conversation],
          (old: any) => ({ data: { data: [...old.data.data, message] } })
        );

        if (currentConversation?._id === message.conversation) {
          updateIsReadMessage({ sender, conversation });
          mySocket?.emit('markAsRead', { sender, conversation });
        }
      }
    }

    function onReceiveAsReadStatus({ conversation }: AsReadPayload) {
      if (queryClient.getQueryData(['message', conversation])) {
        console.log('Mark as read---2');
        queryClient.setQueryData(['message', conversation], (old: any) => ({
          data: {
            data: old.data.data.map((message: MessageDocument) => ({
              ...message,
              isRead: true,
            })),
          },
        }));
      }
    }
    mySocket?.on('receiveMessage', onReceiveMessage);
    mySocket?.on('receiveAsReadStatus', onReceiveAsReadStatus);

    return () => {
      mySocket?.off('receiveMessage', onReceiveMessage);
      mySocket?.off('receiveAsReadStatus', onReceiveAsReadStatus);
    };
  }, [socket, currentConversation, queryClient, updateIsReadMessage]);

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
