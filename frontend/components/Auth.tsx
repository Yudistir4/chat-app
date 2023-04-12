import { Button, Center, Image, Input, Stack, Text } from '@chakra-ui/react';
import axios from 'axios';
import { Session } from 'next-auth';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

interface IAuthProps {
  session: Session | null;
  reloadSession?: () => void;
}

const Auth: React.FunctionComponent<IAuthProps> = ({ session }) => {
  console.log(session);
  console.log(process.env.NEXT_PUBLIC_BASE_URL);
  const [username, setUsername] = useState('');
  const submit = async () => {
    await axios.get(
      (process.env.NEXT_PUBLIC_BASE_URL as string) + 'api/user'
      // { he }
    );
  };
  return (
    <Center height="100vh">
      <Stack spacing={8} align={'center'}>
        {session ? (
          <>
            <Text fontSize="3xl">Enter Username</Text>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
            />
            <Button onClick={submit} width="100%">
              Save
            </Button>
          </>
        ) : (
          <>
            <Image height={100} src="/images/googlelogo.png" alt="logo" />
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
      </Stack>
    </Center>
  );
};

export default Auth;
