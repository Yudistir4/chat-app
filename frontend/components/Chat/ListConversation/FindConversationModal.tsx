import { api } from '@/config';
import { UserDocument } from '@/database/models/user';
import useConversation from '@/store/conversation';
import {
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import UserItem from './UserItem';

interface IFindConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FindConversationModal: React.FunctionComponent<
  IFindConversationModalProps
> = ({ isOpen, onClose }) => {
  const { data: session } = useSession();
  const [username, setUsername] = useState('');

  // get Users
  const { data: dataUsers, refetch } = useQuery({
    enabled: false,
    queryKey: ['users'],
    select: (res) => res.data.data,
    queryFn: () =>
      axios.get<{ data: UserDocument[] }>(`${api.users}?username=${username}`),
  });

  // Create Conversation
  const {
    // data: dataCreateConversation,
    // isLoading: isLoadingCreateConversation,
    // error: errorCreateConversation,
    mutate: mutateCreateConversation,
  } = useMutation({
    mutationFn: (participants: string[]) =>
      axios.post(api.conversations, { participants }),
    onSuccess: (res) => setCurrentConversation(res.data.data),
  });

  const setCurrentConversation = useConversation(
    (state) => state.setCurrentConversation
  );
  if (!session) return <></>;

  const onClickUserItem = async (user: UserDocument) => {
    mutateCreateConversation([session.user.id, user._id]);
    onClose();
  };
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="#2d2d2d" mx={4}>
          <ModalHeader>Find or start conversation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack gap={2}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!username) return;
                  refetch();
                }}
              >
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter a username.."
                />
              </form>
              {dataUsers?.map((user: UserDocument) => (
                <UserItem
                  key={user._id}
                  user={user}
                  onClick={() => onClickUserItem(user)}
                />
              ))}
            </Stack>
          </ModalBody>

          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FindConversationModal;
