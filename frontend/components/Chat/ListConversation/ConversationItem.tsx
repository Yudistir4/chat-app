import { ConversationDocument } from '@/database/models/conversation';
import useConversation from '@/store/conversation';
import { Avatar, Box, Flex, Text } from '@chakra-ui/react';
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
      <Flex
        direction="column"
        width="70%"
        // flexGrow="1"
      >
        <Text isTruncated>{conversation.participants[0].username}</Text>
        <Text isTruncated>{conversation.lastMessage.content}</Text>
      </Flex>
      {conversation.unReadMessages > 0 && (
        <Flex
          alignItems="center"
          justifyContent="center"
          borderRadius={100}
          w={7}
          h={7}
          bg="blue.500"
        >
          <Text>{conversation.unReadMessages}</Text>
        </Flex>
      )}
    </Flex>
  );
};

export default ConversationItem;
