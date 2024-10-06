import { useRef } from "react";
import { SessionViewType } from "../Sessions";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  data: SessionViewType;
  onBack: () => void;
  onSecondary: (_id: string, ongoing: boolean) => void;
  onCheckpoint: (_id: string, data: any) => void;
};

function SessionView({ data, onBack, onSecondary, onCheckpoint }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleCheckpoint = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (formRef.current) {
      const formElement = {
        name: formRef.current.elements.namedItem('name') as HTMLInputElement,
        cooldown: formRef.current.elements.namedItem('cooldown') as HTMLInputElement,
      }
      
      if (formElement.name.value.length == 0) return;
      
      const formData = {
        name: formElement.name.value,
        expires_at: +(formElement.cooldown.value),
      }
      
      formRef.current.reset();
      onCheckpoint(data.session_id, formData);
    }
  }

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
      
      <QRCodeSVG value={data.session_url} className="qr-code" />

      <h2>Additional Info</h2>
      
      <ul>
      {
        (Object.keys(data.additional_info).length > 0) ?
        Object.keys(data.additional_info).map(key => <li key={key}><span>{key}</span> : "{data.additional_info[key]}"</li>)
        : <p>No additional info...</p>
      }
      </ul>
      
      <h2>Attendees</h2>
      
      <div className="session-table">
        <table>
          <thead>
            <tr>
              <td>Member Id</td>
              <td>
                <div>Entry</div>
                <div>{data.entry_expires_at}</div>
              </td>
              {
                data.checkpoints.map(checkpoint => {
                  return (
                    <td>
                      <div>{checkpoint.name}</div>
                      <div>{checkpoint.expires_at}</div>
                    </td>
                  )
                })
              }
            </tr>
          </thead>
          
          <tbody>
            {data.attendees.map(attendee => {
              return (
                <tr key={attendee.member_id}>
                  <td>{attendee.member_id}</td>
                  <td>{attendee.entry ? "Present" : "Absent"}</td>
                  {
                    data.checkpoints.map((checkpoint) => {
                      return (
                        <td>{attendee.checkpoint_ids.includes(checkpoint.name) ? "Present" : "Absent"}</td>
                      )
                    })
                  }
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {
        data.ongoing &&
          <>
          <h2>Checkpoints</h2>

          <form onSubmit={handleCheckpoint} ref={formRef}>
            <div className="session-field">
              <label htmlFor="checkpoint-name">Name : </label>
              <input type="text" name="name" />
            </div>

            <div className="session-field">
              <label htmlFor="session-cooldown">Expires After : </label>
              <select name="cooldown" id="session-cooldown">
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
              </select>
              <button className="button" type='submit'>Create</button>
            </div>
          </form>
          </>
      }
      
      <div className="button-container">
        <button className="button" onClick={onBack}>Back</button>
        <button className="button red" onClick={_ => onSecondary(data.session_id, data.ongoing)}>{data.ongoing ? "End" : "Delete"}</button>
      </div>
    </div>
  )
}

export default SessionView;