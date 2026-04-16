import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
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
        <div className="card group bg-base-100 border border-base-300 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="card-body p-5">

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

                    <div className="flex flex-wrap gap-2">
                        {group.group_topics?.map((topic, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center rounded-full border border-base-300 bg-base-200 px-3 py-1 text-xs font-medium text-base-content/80"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>


                <button
                    className="btn btn-primary w-full"
                    onClick={handleJoin}
                    disabled={isPending || sent}
                >
                    {isPending ? "Sending..." : sent ? "Request Sent" : "Join Group"}
                </button>

            </div>
        </div>
    );
};

export default GroupCardSearch;