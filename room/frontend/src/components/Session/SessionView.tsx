import { SessionViewType } from "../Sessions";

function SessionView({ data, onBack, onSecondary }: { data: SessionViewType, onBack: () => void, onSecondary: (_id: string, ongoing: boolean) => void }) {
  return (
    <div className="session-view">
      <div className="session-field session-id">
        <label>Session Id : </label>
        <input type="text" value={data.session_id} readOnly/>
      </div>

      <div className="session-field">
        <label>Timestamp : </label>
        <input type="text" value={data.timestamp} readOnly/>
      </div>
      
      <h2>Attendees</h2>
      
      <table className="session-table">
        <thead>
          <tr><td>Member Id</td><td>Entry</td><td>Exit</td></tr>
        </thead>
        
        <tbody>
          {data.attendees.map(attendee => {
            return (
              <tr key={attendee.member_id}>
                <td>{attendee.member_id}</td>
                <td>{attendee.attendance.entry ? "Present" : "Absent"}</td>
                <td>{attendee.attendance.exit ? "Present" : "Absent"}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      
      <h2>Additional Info</h2>
      
      <ul>
      {
        (Object.keys(data.additional_info).length > 0) ?
        Object.keys(data.additional_info).map(key => <li key={key}><span>{key}</span> : "{data.additional_info[key]}"</li>)
        : <p>No additional info...</p>
      }
      </ul>
      
      <button className="button" onClick={onBack}>Back</button>
      <button className="button red" onClick={_ => onSecondary(data.session_id, data.ongoing)}>{data.ongoing ? "End" : "Delete"}</button>
    </div>
  )
}

export default SessionView;