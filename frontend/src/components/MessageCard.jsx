const MessageCard = ({ msg, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      
      <div
        className={`
          max-w-[75%] rounded-2xl px-4 py-2 shadow-sm
          ${isOwn 
            ? "bg-primary text-primary-content rounded-br-none" 
            : "bg-base-200 rounded-bl-none"}
        `}
      >
        {/* TEXT */}
        {msg.content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
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
                    className="rounded-lg max-h-60 object-cover"
                  />
                );
              }

              if (file.type === "video") {
                return (
                  <video
                    key={i}
                    controls
                    className="rounded-lg max-h-60"
                  >
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
                  className="block text-sm underline opacity-80 hover:opacity-100"
                >
                  📎 Open file
                </a>
              );
            })}
          </div>
        )}

        {/* TIME */}
        <div className="text-[10px] opacity-60 mt-1 text-right">
          {new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </div>
      </div>

    </div>
  );
};
export default MessageCard;