import useConversation from '@/store/conversation';
import { Flex } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { useEffect, useRef } from 'react';
import { Socket, io } from 'socket.io-client';
import Conversation from './Conversation';
import ListConversation from './ListConversation';

interface IChatProps {
  session: Session;
}

interface User {
  userId: string;
  socketId: string;
}
export interface Data {
  _id: string;
  content: string;
  conversation: string;
  sender: string;
  receiver: string;
  createdAt: Date;
}
export interface ServerToClientEvents {
  getUsers: (users: User[]) => void;
  receiveMessage: (data: Data) => void;
}

export interface ClientToServerEvents {
  addUser: (userId: string) => void;
  sendMessage: (data: Data) => void;
  // joinRoom: (roomId: string) => void;
  // leaveRoom: (roomId: string) => void;
}
const Chat: React.FunctionComponent<IChatProps> = ({ session }) => {
  const socket = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>();
  const currentConversation = useConversation(
    (state) => state.currentConversation
  );
  const setIsCurrentConversationUserOnline = useConversation(
    (state) => state.setIsCurrentConversationUserOnline
  );
  const currentConversationUser = currentConversation?.participants.filter(
    (participant) => participant._id !== session?.user.id
  )[0];
  useEffect(() => {
    if (!socket.current) {
      socket.current = io(process.env.NEXT_PUBLIC_SOCKET_URL as string);
    }
  }, []);
  useEffect(() => {
    socket.current?.emit('addUser', session.user.id);
    socket.current?.on('getUsers', (users) => {
      setIsCurrentConversationUserOnline(
        !!users.find((user) => user.userId === currentConversationUser?._id)
      );
    });
  }, [session, currentConversationUser, setIsCurrentConversationUserOnline]);

  return (
    <Flex height="100vh">
      <ListConversation socket={socket} />
      <Conversation socket={socket} />
    </Flex>
  );
};

export default Chat;
