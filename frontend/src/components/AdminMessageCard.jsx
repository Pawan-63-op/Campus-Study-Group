const AdminMessageCard = ({
  groupChatId,
  msg,
  userId,
  socket,
  isOwn,
}) => {
  return (
    <div className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[75%] rounded-2xl px-4 py-3 shadow-sm
          border border-base-300/60
          ${isOwn
            ? "bg-primary text-primary-content"
            : "bg-base-200 text-base-content"}
        `}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-medium">
            {msg.sender_name || "Unknown"}
          </p>

          <button
            className="btn btn-xs btn-ghost"
            onClick={() => {
              console.log("Deleting:", msg.message_id);

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

        {/* TEXT */}
        {msg.content && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {msg.content}
          </p>
        )}

        {/* FILES */}
        {msg.fetchables?.length > 0 && (
          <div className="mt-2 space-y-2">
            {msg.fetchables.map((file, i) => {
              if (file.type === "image") {
                return (
                  <img
                    key={i}
                    src={file.url}
                    className="rounded-xl max-h-60 w-full object-cover"
                  />
                );
              }

              if (file.type === "video") {
                return (
                  <video key={i} controls className="rounded-xl max-h-60 w-full">
                    <source src={file.url} />
                  </video>
                );
              }

              return (
                <a
                  key={i}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline"
                >
                  📎 Open file
                </a>
              );
            })}
          </div>
        )}

        {/* TIME */}
        <div className="text-[10px] opacity-60 text-right mt-1">
          {new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminMessageCard;