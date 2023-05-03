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
  ClientToServerEvents,
  Data,
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
  console.log('relex');

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
  // Add new message

  // Query Message
  const { data: dataMessage, refetch } = useQuery({
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

  // useEffect(() => {
  //   socket.current?.on('receiveMessage', (message) => {
  //     console.log({ message });

  //     setArrivalMessage(message);
  //   });

  //   socket.current?.on('receiveAsReadStatus', (data) => {
  //     console.log({ data });
  //     setMarkAsRead(true);
  //   });
  // }, [socket]);
  useEffect(() => {
    console.log('---effect---');
    const mySocket = socket.current;
    function onReceiveMessage(message: Data) {
      console.log({ message });
      // if (
      //   currentConversation &&
      //   currentConversation._id === message.conversation &&
      //   queryClient.getQueryData(['message', currentConversation._id])
      // ) {
      //   queryClient.setQueryData(
      //     ['message', currentConversation._id],
      //     (old: any) => ({ data: { data: [...old.data.data, message] } })
      //   );

      //   //  update message to isRead = true
      //   // if (currentConversation.unReadMessages !== 0) {
      //   updateIsReadMessage({
      //     sender: message.sender,
      //     conversation: message.conversation,
      //   });
      //   // }

      //   // TODO: send isRead=true with socket io
      //   mySocket?.emit('markAsRead', {
      //     sender: message.sender,
      //     conversation: message.conversation,
      //   });
      // }
      if (queryClient.getQueryData(['message', message.conversation])) {
        queryClient.setQueryData(
          ['message', message.conversation],
          (old: any) => ({ data: { data: [...old.data.data, message] } })
        );

        if (
          currentConversation &&
          currentConversation._id === message.conversation
        ) {
          updateIsReadMessage({
            sender: message.sender,
            conversation: message.conversation,
          });
          // }

          // TODO: send isRead=true with socket io
          mySocket?.emit('markAsRead', {
            sender: message.sender,
            conversation: message.conversation,
          });
        }
      }
    }

    function onReceiveAsReadStatus(data: {
      conversation: string;
      sender: string;
    }) {
      console.log('Mark as read---1');
      if (
        currentConversation &&
        queryClient.getQueryData(['message', currentConversation._id])
      ) {
        console.log('Mark as read---2');
        queryClient.setQueryData(
          ['message', currentConversation._id],
          (old: any) => ({
            data: {
              data: old.data.data.map((message: MessageDocument) => ({
                ...message,
                isRead: true,
              })),
            },
          })
        );
      }
    }
    mySocket?.on('receiveMessage', onReceiveMessage);
    mySocket?.on('receiveAsReadStatus', onReceiveAsReadStatus);

    return () => {
      mySocket?.off('receiveMessage', onReceiveMessage);
      mySocket?.off('receiveAsReadStatus', onReceiveAsReadStatus);
    };
  }, [socket, currentConversation, queryClient, updateIsReadMessage]);

  // useEffect(() => {
  //   if (
  //     markAsRead &&
  //     currentConversation &&
  //     queryClient.getQueryData(['message', currentConversation._id])
  //   ) {
  //     console.log('Mark as read');
  //     queryClient.setQueryData(
  //       ['message', currentConversation._id],
  //       (old: any) => ({
  //         data: {
  //           data: old.data.data.map((message: MessageDocument) => ({
  //             ...message,
  //             isRead: true,
  //           })),
  //         },
  //       })
  //     );
  //     setMarkAsRead(false);
  //   }
  // }, [markAsRead, currentConversation, queryClient]);

  // useEffect(() => {
  //   if (
  //     socket.current &&
  //     arrivalMessage &&
  //     currentConversation &&
  //     currentConversation._id === arrivalMessage.conversation &&
  //     queryClient.getQueryData(['message', currentConversation._id])
  //   ) {
  //     queryClient.setQueryData(
  //       ['message', currentConversation._id],
  //       (old: any) => ({ data: { data: [...old.data.data, arrivalMessage] } })
  //     );
  //     console.log({ arrivalMessage });

  //     //  update message to isRead = true
  //     // if (currentConversation.unReadMessages !== 0) {
  //     updateIsReadMessage({
  //       sender: arrivalMessage.sender,
  //       conversation: arrivalMessage.conversation,
  //     });
  //     // }

  //     // TODO: send isRead=true with socket io
  //     socket.current.emit('markAsRead', {
  //       sender: arrivalMessage.sender,
  //       conversation: arrivalMessage.conversation,
  //     });

  //     setArrivalMessage(null);
  //   }
  // }, [
  //   arrivalMessage,
  //   queryClient,
  //   currentConversation,
  //   updateIsReadMessage,
  //   socket,
  // ]);

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
