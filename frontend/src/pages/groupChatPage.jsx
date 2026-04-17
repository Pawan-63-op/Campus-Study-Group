import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5002");

const ChatPage = ({ userId }) => {
  const { id: groupChatId } = useParams();

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  const bottomRef = useRef();

  // 🔥 JOIN + LISTEN
  useEffect(() => {
    socket.emit("join-group-chat", { groupChatId });

    socket.on("chat-history", (history) => {
      setMessages(history);
    });

    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat-history");
      socket.off("receive-message");
    };
  }, [groupChatId]);

  // 🔥 AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔥 SEND MESSAGE
  const handleSend = async () => {
    if (!content && files.length === 0) return;

    const fetchables = [];

    for (const file of files) {
      const base64 = await toBase64(file);
      fetchables.push(base64);
    }

    const message = {
      sender_id: userId,
      content,
      fetchables,
      timestamp: new Date().toISOString()
    };

    socket.emit("send-message", {
      groupChatId,
      message
    });

    // optimistic UI
    setMessages((prev) => [...prev, message]);

    setContent("");
    setFiles([]);
  };

  return (
    <div className="flex flex-col h-full">

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={msg.message_id || idx}
            className={`chat ${
              msg.sender_id === userId ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-bubble">

              {/* TEXT */}
              {msg.content && <p>{msg.content}</p>}

              {/* FILES */}
              {msg.fetchables?.length > 0 && (
                <div className="mt-2 space-y-2">
                  {msg.fetchables.map((file, i) => (
                    <img
                      key={i}
                      src={file}
                      alt="upload"
                      className="max-w-xs rounded"
                    />
                  ))}
                </div>
              )}

              {/* TIME */}
              <div className="text-[10px] opacity-60 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>

            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t flex gap-2">

        <input
          type="text"
          className="input input-bordered flex-1"
          placeholder="Type message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <input
          type="file"
          multiple
          onChange={(e) => setFiles([...e.target.files])}
        />

        <button className="btn btn-primary" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;


// 🔧 helper
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}



// import React, { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import { io } from "socket.io-client";

// export default function ChatPage({ userId }) {
//   const { id: friendId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const roomIdRef = useRef("");
//   const socketRef = useRef(null);
//   const endRef = useRef(null);

//   const getRoomId = (a, b) => [a, b].sort().join("-");

//   useEffect(() => {
//     const roomId = getRoomId(userId, friendId);
//     roomIdRef.current = roomId;

//     const socket = io("http://localhost:5002");
//     socketRef.current = socket;
//     socket.emit("join-chat", { roomId });

//     socket.on("chat-history", (history) => setMessages(history));
//     socket.on("receive-message", (msg) => setMessages((prev) => [...prev, msg]));

//     return () => socket.disconnect();
//   }, [userId, friendId]);

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!input.trim()) return;
//     const msg = {
//       senderId: userId,
//       receiverId: friendId,
//       text: input,
//       timestamp: new Date().toISOString(),
//     };
//     setMessages((prev) => [...prev, msg]);
//     socketRef.current.emit("send-message", { roomId: roomIdRef.current, message: msg });
//     setInput("");
//   };

//   return (
//     <div className="flex flex-col h-screen">
//       {/* chat history */}
//       <div className="flex-1 bg-gray-100 p-4 overflow-y-auto space-y-2">
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`flex flex-col ${
//               msg.senderId === userId ? "items-end" : "items-start"
//             }`}
//           >
//             <div
//               className={`p-2 rounded max-w-xs whitespace-pre-wrap ${
//                 msg.senderId === userId ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
//               }`}
//             >
//               <div>{msg.text}</div>
//               <div className="text-xs text-right opacity-60 mt-1">
//                 {new Date(msg.timestamp).toLocaleTimeString()}
//               </div>
//             </div>
//           </div>
//         ))}
//         <div ref={endRef} />
//       </div>

//       {/* input bar */}
//       <div className="p-4 bg-gray-800 flex">
//         <input
//           type="text"
//           placeholder="Type a message…"
//           className="input input-bordered flex-1 mr-2"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />
//         <button className="btn btn-primary" onClick={sendMessage}>
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }
