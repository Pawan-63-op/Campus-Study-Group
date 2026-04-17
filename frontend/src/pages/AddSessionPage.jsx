import { useMutation } from '@tanstack/react-query';
import React from 'react'
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { axiosInstance } from '../lib/axios';
import {toast} from "react-hot-toast"
import { useThemeStore } from '../store/useThemeStore';
const AddSessionPage = () => {
    const { theme } = useThemeStore();
    const { groupId } = useParams();
    const [sessionData, setsessionData] = useState({
        groupChatId: groupId,
        start_time: null,
        end_time: null,
        session_topic: null,
        venue: null
    })

    const { mutate, isLoading, error } = useMutation({
        mutationFn: async (sessionData) => {
            const response = await axiosInstance.post("/sessions/create-session", sessionData);
            return response.data.result;
        },
        onSuccess: () => {
            toast.success("session created succesfully ")
        },
        onError: () => { 
           toast.error("session creation failed");  
        }
    })
    const handleCreate = (e)=>{
        e.preventDefault();
        mutate(sessionData);
        setsessionData({
                groupChatId: groupId,
                start_time: null,
                end_time: null,
                session_topic: null,
                venue: null
            })
    }
    return (
        <div
            className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
            data-theme={theme}
        >
            <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
                <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
                    {/* ERROR MESSAGE IF ANY */}
                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error.response.data.message}</span>
                        </div>
                    )}

                    <div className="w-full">
                        <form onSubmit={handleCreate}>
  <div className="space-y-4">

    <div>
      <h2 className="text-xl font-semibold">Create a new Session</h2>
      <p className="text-sm opacity-70">
        Plan your session properly
      </p>
    </div>

    {/* START TIME */}
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">Start Time</span>
      </label>
      <input
        type="datetime-local"
        className="input input-bordered w-full"
        value={sessionData.start_time || ""}
        onChange={(e) =>
          setsessionData({ ...sessionData, start_time: e.target.value })
        }
        required
      />
    </div>

    {/* END TIME */}
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">End Time</span>
      </label>
      <input
        type="datetime-local"
        className="input input-bordered w-full"
        value={sessionData.end_time || ""}
        onChange={(e) =>
          setsessionData({ ...sessionData, end_time: e.target.value })
        }
        required
      />
    </div>

    {/* SESSION TOPIC */}
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">Session Topic</span>
      </label>
      <input
        type="text"
        placeholder="e.g. Graph Algorithms"
        className="input input-bordered w-full"
        value={sessionData.session_topic || ""}
        onChange={(e) =>
          setsessionData({ ...sessionData, session_topic: e.target.value })
        }
        required
      />
    </div>

    {/* VENUE */}
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">Venue</span>
      </label>
      <input
        type="text"
        placeholder="e.g. Library / Zoom link"
        className="input input-bordered w-full"
        value={sessionData.venue || ""}
        onChange={(e) =>
          setsessionData({ ...sessionData, venue: e.target.value })
        }
        required
      />
    </div>

    {/* SUBMIT */}
    <button className="btn btn-primary w-full" type="submit">
      {isLoading ? "Creating..." : "Create Session"}
    </button>

  </div>
</form>
                    </div>
                </div>

                {/* SIGNUP FORM - RIGHT SIDE */}
                <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
                    <div className="max-w-md p-8">
                        {/* Illustration */}
                        <div className="relative aspect-square max-w-sm mx-auto">
                            <img src="/i2.png" alt="Language connection illustration" className="w-full h-full" />
                        </div>

                        <div className="text-center space-y-3 mt-6">
                            <h2 className="text-xl font-semibold">May this  group lead to Best Future Ahead</h2>
                            <p className="opacity-70">
                                channa mereya mereya ...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddSessionPage
