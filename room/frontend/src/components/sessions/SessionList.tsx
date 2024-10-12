import { useState } from "react";
import { TrashIcon } from "../../assets/Icons";
import { SessionListType } from "./Sessions";

function SessionList({ sessions, onCreate, onView }: { sessions: SessionListType, onCreate: () => void, onView: (_id: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.history.filter(session => session.timestamp.toLowerCase().includes(searchTerm.toLowerCase())).sort().reverse();
  const filteredSessionsError = sessions.history.length == 0 ? "No previous sessions available..." : "No match found..."
  const ongoing = sessions.onGoing !== null;

  return (
    <div className="room-list">
      <div className="ongoing">
        <h2 className="bold">Ongoing: </h2>
        {ongoing ?
          <a className="condensed bold badge" onClick={_ => onView(sessions.onGoing!._id)}>
            {sessions.onGoing!.timestamp}
          </a>
          : <p className="condensed badge">None</p>}
      </div>

      <div className="history">
        <div className="filter">
          <input
            type="text"
            placeholder="Filter sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="condensed fill" onClick={onCreate} disabled={ongoing}>New</button>
        </div>
        {filteredSessions.length > 0 ? (
          <ul>
            {filteredSessions.map(session => (
              <li key={session._id}>
                <a className="bold" onClick={_ => onView(session._id)}>{session.timestamp}</a>
                <TrashIcon onClick={() => { }} />
              </li>))}
          </ul>
        ) : <p className="condensed">{filteredSessionsError}</p>}
      </div>
    </div>
  )
}

export default SessionList;