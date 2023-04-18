import { ConversationDocument } from '@/database/models/conversation';
import useConversation from '@/store/conversation';
import { Avatar, Flex, Text } from '@chakra-ui/react';
import * as React from 'react';

interface IConversationItemProps {
  conversation: ConversationDocument;
  isOnConversation: boolean;
}

const ConversationItem: React.FunctionComponent<IConversationItemProps> = ({
  conversation,
  isOnConversation,
}) => {
  const setCurrentConversation = useConversation(
    (state) => state.setCurrentConversation
  );

  return (
    <Flex
      onClick={() => setCurrentConversation(conversation)}
      alignItems="center"
      gap={3}
      borderRadius={4}
      p={2}
      transition="all"
      transitionDuration="0.1s"
      cursor="pointer"
      width="full"
      bg={isOnConversation ? 'whiteAlpha.200' : ''}
      _hover={{ bg: 'whiteAlpha.200' }}
    >
      <Avatar src={conversation.participants[0].image} />
      <Flex direction="column" width="80%">
        <Text isTruncated>{conversation.participants[0].username}</Text>
        <Text isTruncated>{conversation.lastMessage.content}</Text>
      </Flex>
    </Flex>
  );
};

export default ConversationItem;
