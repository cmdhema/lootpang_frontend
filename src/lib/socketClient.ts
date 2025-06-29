import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false, // 자동으로 연결하지 않고 필요할 때 연결
}); 