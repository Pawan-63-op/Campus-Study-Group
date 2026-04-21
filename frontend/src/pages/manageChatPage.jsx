import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import useAuthUser from "../hooks/useAuthUser.js";
import AdminMessageCard from "../components/AdminMessageCard.jsx";

// 🔥 create ONE socket instance
const socket = io("http://localhost:5002", {
  autoConnect: true,
});

const getFileTypeFromFile = (file) => {
  const type = file.type;

  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (type === "application/pdf") return "pdf";

  return "other";
};

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "chat_uploads");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/ddj28rrje/auto/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  if (!data.secure_url) throw new Error("Upload failed");

  return {
    url: data.secure_url,
    type: getFileTypeFromFile(file),
  };
};

const ManageChatPage = () => {
  const { isLoading, authUser } = useAuthUser();
  const { id: groupChatId } = useParams();

  const userId = authUser?.userID;

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  const bottomRef = useRef();

  // 🔥 SOCKET SETUP
  useEffect(() => {
    if (!groupChatId) return;

    console.log("Joining room:", groupChatId);

    socket.emit("join-group-chat", { groupChatId });

    const handleHistory = (history) => {
      setMessages(history);
    };

    const handleReceive = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleDelete = ({ msgId }) => {
      console.log("Deleting message in UI:", msgId);
      setMessages((prev) =>
        prev.filter((m) => m.message_id !== msgId)
      );
    };

    socket.on("chat-history", handleHistory);
    socket.on("receive-message", handleReceive);
    socket.on("message-deleted", handleDelete);

    return () => {
      socket.off("chat-history", handleHistory);
      socket.off("receive-message", handleReceive);
      socket.off("message-deleted", handleDelete);
    };
  }, [groupChatId]);

  // 🔥 AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔥 SEND MESSAGE
  const handleSend = async () => {
    if (!content && files.length === 0) return;

    let fetchables = [];

    try {
      fetchables = await Promise.all(
        files.map((file) => uploadToCloudinary(file))
      );
    } catch (err) {
      console.error("Upload failed:", err);
      return;
    }

    const message = {
      message_id: Date.now().toString(),
      sender_id: userId,
      sender_name: authUser?.username || "Admin",
      content,
      fetchables,
      timestamp: new Date().toISOString(),
    };

    socket.emit("send-message", {
      groupChatId,
      message,
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
  <div className="h-screen flex flex-col bg-gray-50">

    {/* HEADER */}
    <div className="h-16 px-6 flex items-center justify-between border-b bg-white">
      <div>
        <h2 className="text-lg font-semibold">Message Moderation</h2>
        <p className="text-xs text-gray-500">
          Review and manage group messages
        </p>
      </div>
    </div>

    {/* MESSAGE LIST */}
    <div className="flex-1 overflow-y-auto p-6">

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

        {/* TABLE HEADER */}
        <div className="grid grid-cols-[200px_1fr_120px] gap-4 px-6 py-3 text-xs font-semibold text-gray-500 border-b bg-gray-50">
          <div>Sender</div>
          <div>Message</div>
          <div className="text-center">Action</div>
        </div>

        {/* MESSAGES */}
        <div className="divide-y">
          {messages.map((msg, idx) => (
            <AdminMessageCard
              key={msg.message_id || idx}
              msg={msg}
              isOwn={msg.sender_id === userId}
              userId={userId}
              groupChatId={groupChatId}
              socket={socket}
            />
          ))}
        </div>

      </div>

      <div ref={bottomRef} />
    </div>
  </div>
);
};

export default ManageChatPage;