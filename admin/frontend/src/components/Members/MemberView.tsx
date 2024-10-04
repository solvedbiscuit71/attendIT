function MemberView({ data, onBack, onDelete }: { data: any, onBack: () => void, onDelete: (_id: string) => void }) {
  return (
    <div className="member-view">
      <div className="member-field member-id">
        <label>ID : </label>
        <input type="text" value={data._id} readOnly/>
      </div>

      <div className="member-field">
        <label>Name : </label>
        <input type="text" value={data.name} readOnly/>
      </div>

      <div className="member-field member-ongoing">
        <label>Ongoing Session Id : </label>
        <input type="text" value={data.ongoing_session_id || "None"} readOnly/>
      </div>
      
      <h2>Additional Info</h2>
      
      <ul>
      {
        (Object.keys(data.additional_info).length > 0) ?
        Object.keys(data.additional_info).map(key => <li key={key}><span>{key}</span> : "{data.additional_info[key]}"</li>)
        : <p>No additional info...</p>
      }
      </ul>
      
      <button className="button" onClick={onBack}>Back</button>
      <button className="button red" onClick={_ => onDelete(data._id)} disabled={data.ongoing_session_id !== null}>Delete</button>
    </div>
  )
}

export default MemberView;