import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getUserFriends, sendRoomInvite } from "../lib/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function InviteFriends({ roomId }) {
  const [search, setSearch] = useState("");
  const { data: friends = [], isLoading, isError } = useQuery({
    queryKey: ["UserFriends"],
    queryFn: getUserFriends,
  });

  const { mutate: inviteFriend, isLoading: isInviting } = useMutation({
    mutationFn: ({ friendId }) => sendRoomInvite({ roomId, friendId }),
    onSuccess: () => toast.success("Invitation sent!"),
    onError: () => toast.error("Failed to send invite."),
  });

  const filtered = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-md mx-auto shadow-lg rounded-2xl bg-white">
      <div className="p-6">
        <h3 className="text-center text-2xl font-semibold mb-4">Invite Friends</h3>
        <input
          type="text"
          placeholder="Search friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full input input-bordered mb-6"
        />

        {isLoading ? (
          <p className="text-center text-gray-500">Loading friends...</p>
        ) : isError ? (
          <p className="text-center text-red-500">Error loading friends.</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500">No friends found.</p>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            <AnimatePresence>
              {filtered.map((friend) => (
                <motion.li
                  key={friend._id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    onClick={() => inviteFriend({ friendId: friend._id })}
                    disabled={isInviting}
                    className="w-full flex items-center p-3 bg-base-100 rounded-xl hover:bg-base-200 transition"
                  >
                    <span className="ml-4 flex-grow text-left font-medium">
                      {friend.name}
                    </span>
                    {isInviting && <span className="loading loading-spinner" />}
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
