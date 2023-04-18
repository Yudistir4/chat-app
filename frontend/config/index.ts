const config = {
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL as string,
};

export const api = {
  users: config.BASE_URL + 'api/users',
  conversations: config.BASE_URL + 'api/conversations',
  messages: config.BASE_URL + 'api/messages',
};
export default config;
