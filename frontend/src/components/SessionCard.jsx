import { Link } from "react-router-dom";

const SessionCard = ({ session }) => {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl h-full">
      
      <div className="card-body p-5 flex flex-col h-full">

        {/* Top Section */}
        <div>
          {/* Session Topic */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold tracking-tight truncate">
              {session.session_topic || "Untitled Session"}
            </h3>
            <div className="mt-1 h-1 w-12 rounded-full bg-primary/40" />
          </div>

          {/* Time Info */}
          <div className="mb-4 space-y-1 text-sm text-base-content/70">
            <p>
              <span className="font-medium">Start:</span>{" "}
              {new Date(session.start_time).toLocaleString()}
            </p>
            <p>
              <span className="font-medium">End:</span>{" "}
              {session.end_time
                ? new Date(session.end_time).toLocaleString()
                : "Not specified"}
            </p>
          </div>

          {/* Venue */}
          <div className="mb-5">
            <p className="text-xs font-medium uppercase tracking-wide text-base-content/60 mb-1">
              Venue
            </p>
            <p className="text-sm">
              {session.venue || "Not specified"}
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-2">
          <Link
            to={`/sessions/${session.id}`}
            className="btn btn-primary btn-outline w-full"
          >
            View Details
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SessionCard;