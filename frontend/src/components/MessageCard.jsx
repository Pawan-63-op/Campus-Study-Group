const MessageCard = ({ msg, isOwn }) => {
    return (
        <div className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}>
            <div
                className={`
                    max-w-[75%] rounded-2xl px-4 py-3 shadow-sm
                    border border-base-300/60 backdrop-blur-sm
                    ${isOwn
                        ? "bg-primary text-primary-content rounded-br-none"
                        : "bg-base-200 text-base-content rounded-bl-none"}
                `}

            >
                {(
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.sender_name || "Unknown"}:
                    </p>
                )}

                {/* TEXT */}
                
                {msg.content && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                    </p>
                )}

                {/* FILES */}
                {msg.fetchables?.length > 0 && (
                    <div className="mt-[0.7rem] space-y-[0.48rem]">``
                            {msg.fetchables.map((file, i) => {
                                if (file.type === "image") {
                                return (
                                    <img
                                        key={i}
                                        src={file.url}
                                        alt="attachment"
                                        className="rounded-xl max-h-60 w-full object-cover border border-base-300/50"
                                    />
                                );
                            }

                            if (file.type === "video") {
                                return (
                                    <video
                                        key={i}
                                        controls
                                        className="rounded-xl max-h-60 w-full border border-base-300/50"
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
                                    className="block text-sm underline opacity-80 hover:opacity-100 transition"
                                >
                                    📎 Open file
                                </a>
                            );
                        })}
                    </div>
                )}

                {/* TIME */}
                <div className="mt-1 text-[10px] opacity-69 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
            </div>
        </div>
    );
};

export default MessageCard;