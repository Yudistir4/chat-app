import { UserDocument } from '@/database/models/user';
import useConversation from '@/store/conversation';
import { Avatar, Flex, Text } from '@chakra-ui/react';

interface IHeaderProps {
  currentConversationUser: UserDocument | undefined;
}

const Header: React.FunctionComponent<IHeaderProps> = ({
  currentConversationUser,
}) => {
  const isCurrentConversationUserOnline = useConversation(
    (state) => state.isCurrentConversationUserOnline
  );

  return (
    <Flex alignItems="center" gap={3} py={2} px={4} bg="whiteAlpha.200">
      <Avatar src={currentConversationUser?.image} />
      <Flex direction="column">
        <Text fontWeight={500}>{currentConversationUser?.username}</Text>
        {isCurrentConversationUserOnline && <Text>online</Text>}
      </Flex>
    </Flex>
  );
};

export default Header;
