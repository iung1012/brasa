import { io, type Socket } from "socket.io-client";

let _socket: Socket | null = null;

// URL da API: em dev aponta para :3333, em prod usa a mesma origem
const API_URL = import.meta.env.DEV
  ? "http://localhost:3333"
  : window.location.origin;

export function getSocket(): Socket {
  if (!_socket) {
    const token = localStorage.getItem("brasa_token");
    _socket = io(API_URL, {
      auth: { token },
      autoConnect: true,
      transports: ["websocket"],
    });
  }
  return _socket;
}

export function disconnectSocket() {
  _socket?.disconnect();
  _socket = null;
}
