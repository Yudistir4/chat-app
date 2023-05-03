import useConversation from '@/store/conversation';
import { Flex } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { useEffect, useRef } from 'react';
import { Socket, io } from 'socket.io-client';
import Conversation from './Conversation';
import ListConversation from './ListConversation';
import { getConversationUser } from '@/utils';
import { ClientToServerEvents, ServerToClientEvents, User } from '@/typing';

interface IChatProps {
  session: Session;
}

const Chat: React.FunctionComponent<IChatProps> = ({ session }) => {
  const socket = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>();
  const currentConversation = useConversation(
    (state) => state.currentConversation
  );
  const setIsCurrentConversationUserOnline = useConversation(
    (state) => state.setIsCurrentConversationUserOnline
  );
  const currentConversationUser = getConversationUser(
    currentConversation,
    session
  );
  useEffect(() => {
    if (!socket.current) {
      socket.current = io(process.env.NEXT_PUBLIC_SOCKET_URL as string);
    }
  }, []);

  useEffect(() => {
    function onGetUsers(users: User[]) {
      console.log('getUsers---');
      setIsCurrentConversationUserOnline(
        !!users.find((user) => user.userId === currentConversationUser?._id)
      );
    }
    socket.current?.emit('addUser', session.user.id);
    socket.current?.on('getUsers', onGetUsers);
    return () => {
      socket.current?.off('getUsers', onGetUsers);
    };
  }, [session, currentConversationUser, setIsCurrentConversationUserOnline]);

  return (
    <Flex height="100vh" overflowX="hidden">
      <ListConversation socket={socket} />
      <Conversation socket={socket} />
    </Flex>
  );
};

export default Chat;
