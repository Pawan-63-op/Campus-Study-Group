import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import { useEffect } from "react";
import { useState } from "react";
import { useStateStore } from "stream-chat-react";
import { UserPlus } from "lucide-react";
import { useParams } from "react-router-dom";
const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const isRoomPage = location.pathname?.startsWith("/Room");
  const { id: roomId } = useParams();
  // const queryClient = useQueryClient();
  // const { mutate: logoutMutation } = useMutation({
  //   mutationFn: logout,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  const { logoutMutation } = useLogout();
  const [showInviteBox, setShowInviteBox] = useState(false);
  return (
<nav className="bg-base-200 border-b border-base-300 h-16 flex items-center px-6">
  <div className="flex items-center justify-end w-full">

    {/* RIGHT SIDE */}
    <div className="flex items-center gap-3 sm:gap-4 ml-auto">
      <Link to={"/notifications"}>
        <button className="btn btn-ghost btn-circle">
          <BellIcon className="h-6 w-6 text-base-content opacity-70" />
        </button>
      </Link>
    </div>

    {/* INVITE */}
    {(isChatPage || isRoomPage) && (
      <div className="relative pl-5">
        <button
          className="btn btn-ghost btn-circle"
          onClick={() => setShowInviteBox((prev) => !prev)}
        >
          <UserPlus size={20} />
        </button>

        {showInviteBox && (
          <div className="absolute right-0 mt-2 z-50">
            <InviteFriends roomId={roomId} />
          </div>
        )}
      </div>
    )}

    <ThemeSelector />

    <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
      <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
    </button>

  </div>
</nav>
  );
};
export default Navbar;
