import { UserDocument } from '@/database/models/user';
import useConversation from '@/store/conversation';
import { Avatar, Box, Flex, Text } from '@chakra-ui/react';
import { IoArrowBackOutline } from 'react-icons/io5';
interface IHeaderProps {
  currentConversationUser: UserDocument | undefined;
}

const Header: React.FunctionComponent<IHeaderProps> = ({
  currentConversationUser,
}) => {
  const isCurrentConversationUserOnline = useConversation(
    (state) => state.isCurrentConversationUserOnline
  );
  const setCurrentConversation = useConversation(
    (state) => state.setCurrentConversation
  );

  return (
    <Flex alignItems="center" gap={3} py={2} px={2} bg="whiteAlpha.200">
      <Box
        cursor="pointer"
        onClick={() => setCurrentConversation(null)}
        display={{ sm: 'block', md: 'none' }}
        borderRadius={100}
        p={2}
        _hover={{ bg: 'whiteAlpha.200' }}
      >
        <IoArrowBackOutline fontSize={25} />
      </Box>
      <Avatar src={currentConversationUser?.image} />
      <Flex direction="column">
        <Text fontWeight={500}>{currentConversationUser?.username}</Text>
        {isCurrentConversationUserOnline && <Text>online</Text>}
      </Flex>
    </Flex>
  );
};

export default Header;
