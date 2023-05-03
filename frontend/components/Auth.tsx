import { api } from '@/config';
import {
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  Image,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import { isError, useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Session } from 'next-auth';
import { signIn, useSession } from 'next-auth/react';
import { FormEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { BsMessenger } from 'react-icons/bs';
interface IAuthProps {
  session: Session | null;
  reloadSession?: () => void;
}

const schema = yup
  .object({
    username: yup
      .string()
      .trim()
      .strict()
      .lowercase()
      .required()
      .matches(/^\S+$/, 'Name must not contain white space'),
  })
  .required();

const Auth: React.FunctionComponent<IAuthProps> = ({ session }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ username: string }>({ resolver: yupResolver(schema) });

  const { update } = useSession();

  const { mutate, isLoading, error } = useMutation<
    any,
    AxiosError<{ message: string }>,
    string
  >({
    mutationFn: (username) =>
      axios.put(`${api.users}/${session?.user.id}`, {
        username,
      }),
    onSuccess: () => update(),
  });
  const onSubmit = handleSubmit((data) => mutate(data.username));

  return (
    <Center height="100vh">
      <Flex direction="column" gap={4} align={'center'}>
        {session ? (
          <>
            <Text fontSize="3xl">Enter Username</Text>
            <form onSubmit={onSubmit}>
              {error && (
                <Text mb={2} color="red.500" textAlign="center">
                  {error?.response?.data.message}
                </Text>
              )}

              <FormControl isInvalid={!!errors.username}>
                <Input {...register('username')} placeholder="username" />
                <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
              </FormControl>
              <Button isLoading={isLoading} type="submit" width="100%" mt={4}>
                Save
              </Button>
            </form>
          </>
        ) : (
          <>
            <BsMessenger fontSize={80} />
            <Text fontSize={'4xl'}>Messenger</Text>
            <Text width="70%" align="center">
              Sign in with Google to send unlimited free messages to your
              friends
            </Text>
            <Button
              onClick={() => signIn('google')}
              leftIcon={
                <Image height="20px" src="/images/googlelogo.png" alt="logo" />
              }
            >
              Continue with Google
            </Button>
          </>
        )}
      </Flex>
    </Center>
  );
};

export default Auth;
