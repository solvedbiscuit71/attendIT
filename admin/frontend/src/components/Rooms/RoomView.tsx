function RoomView({ data, onBack, onDelete }: { data: any, onBack: () => void, onDelete: (_id: string) => void }) {
  return (
    <div className="room-create">
      <div className="room-field">
        <label>Name : </label>
        <input type="text" value={data._id} readOnly />
      </div>
      <div className="room-field room-ongoing">
        <label>Ongoing Session Id :</label>
        <input type="text" value={data.ongoing_session_id || "None"} readOnly />
      </div>

      <h2>Additional Info</h2>

      <ul>
        {
          Object.keys(data.additional_info).length > 0 ?
            Object.keys(data.additional_info).map(key => <li key={key}><span>{key}</span> : "{data.additional_info[key]}"</li>)
            : <p>No additional info...</p>
        }
      </ul>

      <button onClick={onBack}>Back</button>
      <button className="red-button" disabled={data.ongoing_session_id !== null} onClick={() => onDelete(data._id)}>Delete</button>
    </div>
  )
}

export default RoomView;