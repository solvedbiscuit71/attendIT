import { useRef } from "react";
import { SessionViewType } from "./Sessions";
import { QRCodeSVG } from "qrcode.react";
import { RefreshIcon } from "../../assets/Icons";

interface Props {
  data: SessionViewType;
  onBack: () => void;
  onSecondary: (_id: string, ongoing: boolean) => void;
  onCheckpoint: (_id: string, data: any) => void;
  onRefresh: (_id: string) => void;
};

function SessionView({ data, onBack, onSecondary, onCheckpoint, onRefresh }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  console.log(data)

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
    <div className="room-create room-view">
      <legend>

        <div className="details-container">
          <div className="details">
            <h1 className="condensed bold">Start Time: {data.timestamp}</h1>
            <div className="additional-info">
              <h2 className="condensed bold">Additional Info</h2>
              <div>
                {
                  Object.keys(data.additional_info).length > 0 ?
                    <ul>
                      {
                        Object.keys(data.additional_info).map(key => <li key={key}> <span className="key condensed bold">{key}:</span>
                          <span className="value">{data.additional_info[key]}"</span>
                        </li>)
                      }
                    </ul>
                    : <p className="condensed">No additional info...</p>
                }
              </div>
            </div>
          </div>
          {data.ongoing &&
            <div className="qr-container">
              <QRCodeSVG value={data.session_url} bgColor="#e3e3e3" fgColor="#191919" className="qr-code" />
            </div>
          }
        </div>

        <div className="attendees">
          <div className="header">
            <h2 className="condensed bold">Attendees</h2>
            {data.ongoing && <RefreshIcon onClick={() => onRefresh(data.session_id)} />}
          </div>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <td className="condensed bold">Member Id</td>
                  {
                    data.checkpoints.map(checkpoint => {
                      return (
                        <td className="condensed bold">
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
        </div>

        {
          data.ongoing &&
          <div className="checkpoints">
            <h2 className="condensed bold">Checkpoints</h2>

            <form onSubmit={handleCheckpoint} ref={formRef}>
              <div className="field">
                <label className="condensed bold" htmlFor="checkpoint-name">Name:</label>
                <input className="condensed" type="text" name="name" placeholder="Break" />
              </div>

              <div className="field">
                <label className="condensed bold" htmlFor="session-cooldown">Expires After:</label>
                <select className="condensed" name="cooldown" id="session-cooldown">
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                </select>
                <button className="fill" type='submit'>Create</button>
              </div>
            </form>
          </div>
        }
      </legend>

      <div className={`button-container ${data.ongoing ? "left" : "right"}`}>
        <button className="stroke" onClick={onBack}>Back</button>
        {data.ongoing && <button className="fill" onClick={_ => onSecondary(data.session_id, data.ongoing)}>End</button>}
      </div>
    </div>
  )
}

export default SessionView;