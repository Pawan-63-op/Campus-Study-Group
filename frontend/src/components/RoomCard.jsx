import { Link } from "react-router-dom";
import { LANGUAGE_TO_FLAG } from "../constants";

const RoomCard = ({ room }) => {
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex flex-col gap-1 mb-3">
          <h3 className="font-semibold truncate">{room.title}</h3>
          <h3 className="font-medium text-sm text-gray-500">{room.language}</h3>
        </div>

        <Link to={`/Room/${room._id}`} className="btn btn-outline w-full">
          Join Again
        </Link>
      </div>
    </div>
  );
};

export default RoomCard;
