import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";

const GroupCardSearch = ({ group }) => {
    const [sent, setSent] = useState(false);

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post("/group/join", {
                groupChatId: group._id,
            });
            return response.data.result;
        },
        onSuccess: () => {
            toast.success("Join request sent");
            setSent(true);
        },
        onError: () => {
            toast.error("Failed to send request");
        },
    });

    const handleJoin = (e) => {
        e.preventDefault();
        mutate();
    };

    return (
        <div className="card group bg-base-100 border border-base-300 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl h-full">
            
            {/* FLEX COLUMN */}
            <div className="card-body p-5 flex flex-col h-full">

                {/* Top Content */}
                <div>
                    {/* Header */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold tracking-tight truncate">
                            {group.group_name}
                        </h3>
                        <div className="mt-1 h-1 w-12 rounded-full bg-primary/40" />
                    </div>

                    {/* Topics */}
                    <div className="mb-5">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-base-content/60">
                            Topics
                        </p>

                        <div className="flex flex-wrap gap-2 max-h-20 overflow-hidden">
                            {group.group_topics?.length > 0 ? (
                                group.group_topics.map((topic, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center rounded-full border border-base-300 bg-base-200 px-3 py-1 text-xs font-medium text-base-content/80"
                                    >
                                        {topic}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-base-content/50">
                                    No topics
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Button pinned to bottom */}
                <div className="mt-auto">
                    <button
                        className="btn btn-primary w-full"
                        onClick={handleJoin}
                        disabled={isPending || sent}
                    >
                        {isPending
                            ? "Sending..."
                            : sent
                            ? "Request Sent"
                            : "Join Group"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default GroupCardSearch;