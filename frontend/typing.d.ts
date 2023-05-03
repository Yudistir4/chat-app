export interface User {
  userId: string;
  socketId: string;
}
export interface MessageData {
  _id: string;
  content: string;
  conversation: string;
  sender: string;
  receiver: string;
  createdAt: Date;
}

export interface AsReadPayload {
  conversation: string;
  sender: string;
}
export interface ServerToClientEvents {
  getUsers: (users: User[]) => void;
  receiveMessage: (message: MessageData) => void;
  receiveAsReadStatus: (data: AsReadPayload) => void;
}

export interface ClientToServerEvents {
  addUser: (userId: string) => void;
  sendMessage: (message: MessageData) => void;
  markAsRead: (data: AsReadPayload) => void;
}
