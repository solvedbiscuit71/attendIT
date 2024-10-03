function RoomView({ data, onBack, onDelete }: { data: any, onBack: () => void, onDelete: (_id: string) => void }) {
  return (
    <div className="room-create">
      <div className="room-name">
        <label htmlFor="roomid">Name</label>
        <input type="text" id='room-id' value={data._id} readOnly />
      </div>
      <div className="room-name">
        <label htmlFor="roomid">Ongoing Session?</label>
        <input type="text" id='room-id' value={data.ongoing_session ? "Yes" : "No"} readOnly />
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
      <button className="red-button" onClick={_ => onDelete(data._id)}>Delete</button>
    </div>
  )
}

export default RoomView;