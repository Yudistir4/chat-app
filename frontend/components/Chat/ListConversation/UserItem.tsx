import { UserDocument } from '@/database/models/user';
import { Avatar, Flex, Text } from '@chakra-ui/react';
import * as React from 'react';

interface IUserItemProps {
  onClick: () => void;
  user: UserDocument;
}

const UserItem: React.FunctionComponent<IUserItemProps> = ({
  user,
  onClick,
}) => {
  return (
    <Flex
      onClick={onClick}
      alignItems="center"
      gap={3}
      borderRadius={4}
      p={2}
      transition="all"
      transitionDuration="0.1s"
      cursor="pointer"
      _hover={{ bg: 'whiteAlpha.200' }}
    >
      <Avatar />
      <Text>{user.username}</Text>
    </Flex>
  );
};

export default UserItem;
