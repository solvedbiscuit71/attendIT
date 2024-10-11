import { TrashIcon } from "../../assets/Icons";

function RoomView({ data, onBack }: { data: any, onBack: () => void }) {
  return (
    <div className="room-create room-view">
      <legend>
        <h1 className="condensed bold">
        <span> Room: {data._id} </span>
        {data.ongoing_session_id !== null ? <span className="badge">Ongoing</span> : undefined}
        </h1>
        <div className="field">
          <label className="condensed bold" htmlFor="room-create-pwd">Password</label>
          <input className="condensed" placeholder="Enter new password..." type="password" id="room-create-pwd"/>
        </div>

        <div>
        <h2>Additional Info</h2>
        <div>
          <ul>
            {
              Object.keys(data.additional_info).length > 0 ?
              Object.keys(data.additional_info).map(key => (
                <li key={key}>
                  <span className="key condensed bold">{key}:</span>
                  <span className="value">{data.additional_info[key]}</span>
                  <TrashIcon/>
                </li>))
              : <p className="condensed">No additional info...</p>
            }
          </ul>
          <form onSubmit={()=>{}}>
            <input className="condensed bold" type="text" name="key" id="key" placeholder='Key' />
            <span className="condensed bold">:</span>
            <input type="text" name="value" id="value" placeholder='Value' />
            <button className="fill" type='submit'>Add</button>
          </form>
        </div>
        </div>

      </legend>

      <div className="button-container">
        <button className="stroke" onClick={onBack}>Back</button>
        <button className="fill" onClick={() => {}}>Update</button>
      </div>
    </div>
  )
}

export default RoomView;