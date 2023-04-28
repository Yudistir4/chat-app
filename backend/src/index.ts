import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

console.log();
interface Data {
  _id: string;
  content: string;
  conversation: string;
  sender: string;
  receiver: string;
  createdAt: Date;
}
interface ServerToClientEvents {
  getUsers: (users: User[]) => void;
  receiveMessage: (data: Data) => void;
}

interface ClientToServerEvents {
  addUser: (userId: string) => void;
  sendMessage: (data: Data) => void;
  // joinRoom: (roomId: string) => void;
  // leaveRoom: (roomId: string) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>({
  cors: {
    origin: process.env.CLIENT_URL,
  },
});
interface User {
  userId: string;
  socketId: string;
}
let users: User[] = [];
const addUser = (userId: string, socketId: string) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};
const removeUser = (socketId: string) => {
  users = users.filter((user) => user.socketId !== socketId);
};
const getUser = (userId: string) => {
  return users.find((user) => user.userId === userId);
};

io.on('connection', (socket) => {
  console.log({ socketId: socket.id });

  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    io.emit('getUsers', users);
  });

  socket.on('sendMessage', (data) => {
    console.log({ message: data });
    const user = getUser(data.receiver);
    if (user) {
      io.to(user.socketId).emit('receiveMessage', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected! : ', socket.id);
    removeUser(socket.id);
    io.emit('getUsers', users);
  });
});

io.listen(5000);

// socket.on('joinRoom', (conversation) => {
//   console.log({ join: conversation });
//   socket.join(conversation);

//   const clients = io.sockets.adapter.rooms.get(conversation);
//   console.log(`Clients in ${conversation}:`);
//   if (clients) {
//     clients.forEach((clientId) => {
//       const clientSocket = io.sockets.sockets.get(clientId);
//       console.log(clientSocket?.id);
//     });
//   }
// });
// socket.on('leaveRoom', (conversation) => {
//   socket.leave(conversation);
// });
// socket.on('disconnecting', () => {
//   console.log({ rooms: socket.rooms }); // the Set contains at least the socket ID
// });

// socket.on('sendMessage', (senderId, conversationId, content) => {
//   const user = getUser(conversationId);
// });
