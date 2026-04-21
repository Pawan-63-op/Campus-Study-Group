import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import useAuthUser from "../hooks/useAuthUser";
import MessageCard from "../components/MessageCard.jsx";

const socket = io("http://localhost:5002");

// 🔥 correct type detection from File
const getFileTypeFromFile = (file) => {
  const type = file.type;

  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (type === "application/pdf") return "pdf";

  return "other";
};

// 🔥 upload function
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "chat_uploads");

  console.log("Uploading:", file.name);

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/ddj28rrje/auto/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();

  if (!data.secure_url) {
    throw new Error("Upload failed");
  }

  const file_type = getFileTypeFromFile(file); // ✅ FIXED

  console.log("Uploaded:", data.secure_url, file_type);

  return {
    url: data.secure_url,
    type: file_type
  };
};

const ChatPage = () => {
  const { isLoading, authUser } = useAuthUser();
  const { id: groupChatId } = useParams();
  const fileInputRef = useRef(null);
  const userId = authUser?.userID;

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [users,setUsers] = useState([]);
  const bottomRef = useRef();

  // 🔥 JOIN + LISTEN
  useEffect(() => {
    if (!groupChatId) return;

    socket.emit("join-group-chat", { groupChatId });

    socket.on("chat-history", (history) => {
      setMessages(history);
    });
    socket.on("chat-users",(users)=>{
      console.log("USERS IN CHAT:", users);
      // made it work some how 
      setUsers(users);
    });

    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("message-deleted",({msgId})=>{
      // socket.emit("join-group-chat", { groupChatId });
      setMessages((prev) => prev.filter(m => m.message_id !== msgId));
      // work around to get the chat history again after deletion. Can be optimized by removing the deleted message from the state instead of fetching everything again.
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
    console.log("SEND CLICKED", files);

    if (!content && files.length === 0) return;

    let fetchables = [];

    try {
      fetchables = await Promise.all(
        files.map((file) => uploadToCloudinary(file))
      );
    } catch (err) {
      console.error("Upload error:", err);
      return; // stop if upload fails
    }

    const message = {
      message_id: Date.now().toString(),
      sender_id: userId,
      sender_name: authUser?.username || "Unknown",
      content,
      fetchables,
      timestamp: new Date().toISOString()
    };

    socket.emit("send-message", {
      groupChatId,
      message
    });

    setMessages((prev) => [...prev, message]);

    setContent("");
    setFiles([]);
    setContent("");
// 🔥 THIS LINE FIXES YOUR ISSUE
if (fileInputRef.current) {
  fileInputRef.current.value = "";
}
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading...
      </div>
    );
  }

 return (
  <div className="flex h-screen bg-gray-50">

    {/* MAIN CHAT */}
    <div className="flex flex-col flex-1">

      {/* HEADER */}
      <div className="h-16 flex items-center justify-between px-6 border-b bg-white">
        <div>
          <h2 className="text-lg font-semibold">Study Group</h2>
          <p className="text-xs text-gray-500">{users.length} members</p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <MessageCard
            key={msg.message_id || idx}
            msg={msg}
            isOwn={msg.sender_id === userId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t bg-white flex gap-3 items-center">

        <input
          type="text"
          className="flex-1 rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

<input
  type="file"
  multiple
  ref={fileInputRef}
  onChange={(e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
  }}
/>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>

    {/* RIGHT SIDEBAR (USERS) */}
    <div className="w-64 border-l bg-white p-4 hidden md:flex flex-col">

      <h3 className="text-sm font-semibold text-gray-500 mb-4">
        Members ({users.length})
      </h3>

      <div className="flex-1 overflow-y-auto space-y-2">
        {users.map((user) => (
          <div
            key={user.userID}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
          >
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-sm font-semibold">
              {user.username[0]}
            </div>
            <span className="text-sm">{user.username}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
};

export default ChatPage;