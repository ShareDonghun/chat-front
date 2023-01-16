import { useEffect, useState } from "react";
import { nanoid } from "nanoid";

const WEBSOCKET_SERVER_URL = "ws://localhost:3030";

interface CustomWebSocket extends WebSocket {
  nickName?: string;
}

interface ChatLog {
  userName: string;
  message: string;
}

export const useSocket = () => {
  const [count, setCount] = useState<number>(0);
  const [socket, setSocket] = useState<CustomWebSocket | null>(null);
  const [userName, setUserName] = useState<string>("익명");
  const [chat, setChat] = useState<string>("");

  const [chatLog, setChatLog] = useState<ChatLog[]>([
    { userName: "운영자", message: "채팅방에 오신 것을 환영합니다" },
  ]);

  useEffect(() => {
    const newSocket: any = new WebSocket(WEBSOCKET_SERVER_URL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.addEventListener("message", (message: any) => {
      const parsedData = JSON.parse(message.data);

      switch (parsedData.type) {
        case "chat":
          setChatLog((prev) => [
            ...prev,
            { userName: parsedData.userName, message: parsedData.message },
          ]);

          break;

        case "liveCount":
          console.log(parsedData.message);
          setCount(parsedData.count);
          break;

        default:
          break;
      }
    });
  }, [socket]);

  const initCount = () => {
    socket?.send(JSON.stringify({ type: "checkCount" }));
  };

  const sendMessage = (message: string) => {
    const messageObject = JSON.stringify({
      type: "chat",
      message: message,
      userName: userName,
    });
    socket?.send(messageObject);
  };

  const setNickName = () => {
    const nickName = JSON.stringify({
      type: "nickName",
      message: userName,
    });
    socket?.send(nickName);
  };

  const onEnterNickName = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.key === "Enter") {
      setNickName();
      alert("닉네임이 변경되었습니다.");
    }
  };

  const onEnterChat = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.key === "Enter") {
      if (chat.trim() === "") return;
      sendMessage(chat);
      setChat("");
    }
  };

  const onChangeNickName = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setUserName(event.target.value);
  };

  const onChangeChat = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setChat(event.target.value);
  };

  return {
    initCount,
    count,
    userName,
    onChangeNickName,
    onEnterNickName,
    onChangeChat,
    chat,
    onEnterChat,
    chatLog,
  };
};
