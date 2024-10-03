import { useState } from "react";
import { HistoryIcon, OnGoingIcon } from "../../assets/Icons";

interface SessionType {
  onGoing: { timestamp: string; } | null;
  history: { timestamp: string; }[]
};

function SessionList({ sessions, onCreate, onView }: { sessions: SessionType, onCreate: () => void, onView: (name: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.history.filter(session => session.timestamp.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredSessionsError = sessions.history.length == 0 ? "No previous sessions available..." : "No match found..."
  const ongoing = sessions.onGoing !== null;
  
  const handleCreate = () => {
    if (ongoing) return;
    onCreate();
  }

  return (
    <>
      <div className="header">
        <input
          type="text"
          placeholder="Filter sessions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className={ongoing ? "new-button disabled" : "new-button"} onClick={handleCreate}>New</button>
      </div>
      <div className="session-list">
        <div>
          <h2><OnGoingIcon/> Ongoing</h2>
          {ongoing ?
            <a onClick={_ => onView(sessions.onGoing!.timestamp)}>
              {sessions.onGoing!.timestamp}
            </a>
            : <p>No ongoing session...</p>}
        </div>

        <div>
          <h2><HistoryIcon/> History</h2>
          <ul className="list">
            {filteredSessions.length > 0 ? filteredSessions.map(session => <li key={session.timestamp}>
              <a onClick={_ => onView(session.timestamp)}>
              {session.timestamp}
              </a></li>) : <p>{filteredSessionsError}</p>}
          </ul>
        </div>
      </div>
    </>
  )
}

export default SessionList;