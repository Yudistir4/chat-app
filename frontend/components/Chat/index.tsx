import { Flex } from '@chakra-ui/react';
import { Session } from 'next-auth';
import * as React from 'react';
import ListConversation from './ListConversation';
import Conversation from './Conversation';

interface IChatProps {
  session: Session;
}

const Chat: React.FunctionComponent<IChatProps> = (props) => {
  return (
    <Flex height="100vh">
      <ListConversation />
      <Conversation />
    </Flex>
  );
};

export default Chat;
