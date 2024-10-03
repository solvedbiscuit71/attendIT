function MemberView({ data, onBack, onDelete }: { data: any, onBack: () => void, onDelete: (_id: string) => void }) {
  return (
    <div className="member-view">
      <div className="member-field member-id">
        <label htmlFor="member-id">ID</label>
        <input type="text" id='member-id' value={data._id} readOnly/>
      </div>

      <div className="member-field member-name">
        <label htmlFor="member-name">Name</label>
        <input type="text" id='member-name' value={data.name} readOnly/>
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
      <button className="button red" onClick={_ => onDelete(data._id)}>Delete</button>
    </div>
  )
}

export default MemberView;