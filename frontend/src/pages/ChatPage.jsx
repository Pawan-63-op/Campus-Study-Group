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
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
          onChange={(e) => {
            const selected = Array.from(e.target.files);
            console.log("FILES SELECTED:", selected);
            setFiles(selected);
          }}
        />

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;