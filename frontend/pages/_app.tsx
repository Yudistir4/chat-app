import '@/styles/globals.css';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { theme } from '../chakra/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const queryClient = new QueryClient();
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
