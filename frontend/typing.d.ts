export interface User {
  userId: string;
  socketId: string;
}
export interface Data {
  _id: string;
  content: string;
  conversation: string;
  sender: string;
  receiver: string;
  createdAt: Date;
}
export interface ServerToClientEvents {
  getUsers: (users: User[]) => void;
  receiveMessage: (data: Data) => void;
  receiveAsReadStatus: (data: { conversation: string; sender: string }) => void;
}

export interface ClientToServerEvents {
  addUser: (userId: string) => void;
  sendMessage: (data: Data) => void;
  markAsRead: (data: { conversation: string; sender: string }) => void;
}
