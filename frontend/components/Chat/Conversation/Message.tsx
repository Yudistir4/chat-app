import { MessageDocument } from '@/database/models/message';
import { Flex, Stack, Text } from '@chakra-ui/react';
import * as React from 'react';

interface IMessageProps {
  isOwn: boolean;
  message: MessageDocument;
}

const Message: React.FunctionComponent<IMessageProps> = ({
  isOwn,
  message,
}) => {
  const date = new Date(message.createdAt);
  let hour = date.getHours();
  if (hour === 24) {
    hour = 0;
  }
  let time = date
    .toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    })
    .substring(2);

  time = `${hour.toString().padStart(2, '0')}${time}`;
  return (
    <Flex
      align="flex-end"
      flexDirection={isOwn ? 'row-reverse' : 'row'}
      gap={1}
      maxWidth="70%"
      marginLeft={isOwn ? 'auto' : ''}
    >
      <Text
        width="fit-content"
        px={4}
        py={2}
        borderRadius={`25px 25px ${isOwn ? '0 25px' : '25px 0'}`}
        bg={isOwn ? 'blue.500' : 'whiteAlpha.300'}
      >
        {message.content}
      </Text>
      <Flex direction="column">
        {isOwn && message.isRead && (
          <Text fontSize="xs" color="whiteAlpha.700">
            Read
          </Text>
        )}
        <Text fontSize="xs" color="whiteAlpha.700">
          {time}
        </Text>
      </Flex>
    </Flex>
  );
};

export default Message;
