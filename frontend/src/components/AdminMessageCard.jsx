const AdminMessageCard = ({
  groupChatId,
  msg,
  userId,
  socket,
}) => {
  return (
    <div className="grid grid-cols-[200px_1fr_120px] gap-4 px-6 py-4 items-center hover:bg-gray-50 transition">

      {/* SENDER */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-sm font-semibold">
          {msg.sender_name?.[0] || "U"}
        </div>
        <span className="text-sm font-medium truncate">
          {msg.sender_name || "Unknown"}
        </span>
      </div>

      {/* MESSAGE */}
      <div className="flex flex-col gap-1 pr-4">
        {msg.content && (
          <p className="text-sm text-gray-700 truncate">
            {msg.content}
          </p>
        )}

        {/* FILES */}
        {msg.fetchables?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {msg.fetchables.map((file, i) => {
              if (file.type === "image") {
                return (
                  <img
                    key={i}
                    src={file.url}
                    className="h-12 w-12 object-cover rounded"
                  />
                );
              }

              return (
                <a
                  key={i}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs underline text-blue-600"
                >
                  File
                </a>
              );
            })}
          </div>
        )}

        {/* TIME */}
        <span className="text-[10px] text-gray-400">
          {new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* DELETE */}
      <div className="flex justify-center">
        <button
          className="p-2 rounded-full hover:bg-red-100 text-red-500"
          onClick={() => {
            socket.emit("delete-post", {
              groupChatId,
              userId,
              postId: msg.message_id,
            });
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default AdminMessageCard;