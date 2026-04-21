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
    <div className="flex flex-col h-full">

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
            setFiles(Array.from(e.target.files));
          }}
        />

        <button
          className="btn btn-primary"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ManageChatPage;