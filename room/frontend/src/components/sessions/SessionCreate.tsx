import { useState, useRef } from "react";
import { MemberType } from "./Sessions";
import { TrashIcon } from "../../assets/Icons";


function SessionCreate({onSubmit, membersData}: {onSubmit: (data: any) => void, membersData: MemberType[]}) {
  const [fields, setFields] = useState<any>({});
  const [members, setMembers] = useState<MemberType[]>(membersData);
  const formRef = useRef<HTMLFormElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  
  const addField = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (formRef.current) {
      const formElement = {
        key: formRef.current.elements.namedItem('key') as HTMLInputElement,
        value: formRef.current.elements.namedItem('value') as HTMLInputElement,
      }
      
      const formData = {
        key: formElement.key.value,
        value: formElement.value.value,
      }
      
      formRef.current.reset();

      setFields((fields: any) => {
        return {...fields, [formData.key]: formData.value};
      })
    }
  }
    
  const removeField = (toRemove: string) => {
    console.log(toRemove)
    setFields((fields: any) => Object.keys(fields).filter(key => key !== toRemove)
      .reduce((obj, key) => {
          //@ts-ignore
          obj[key] = fields[key];
          return obj;
      }, {})
    );
  }
  
  const handleSubmit = () => {
    const selectedMembers= members.filter(member => member.selected)
    if (selectRef.current && selectedMembers.length > 0) {
      const data = {
        additional_info: fields,
        member_ids: selectedMembers.map(member => member._id),
        expires_at: +(selectRef.current.value)
      }
      onSubmit(data)
    }
  }
  
  const handleCheck = (_id: string) => {
    setMembers(members.map(member => {
      if (member._id == _id && member.ongoing_session_id === null) {
        member.selected = member.selected ? false : true;
      }
      return member;
    }))
  }

  return (
    <div className="room-create">
      <legend>
        <div className="participants">
          <h2 className="condensed bold">Participants</h2>
          {
            members.length > 0 ?
              <ul>
                {members.sort((a, b) => {
                      if (a._id < b._id) return -1;
                      else if (a._id > b._id) return 1;
                      else return 0;
                    }).map(member =>
                  <li key={member._id}>
                    <input id={`checkbox-${member._id}`} type="checkbox" onClick={() => handleCheck(member._id)} disabled={member.ongoing_session_id !== null} />
                    <label className="condensed" htmlFor={`checkbox-${member._id}`}>
                      <span className="bold">{member._id}</span>
                      <span>{member.name}</span>
                    </label>
                  </li>)}
              </ul>
              : <p>No members avialable...</p>
          }
        </div>

        <div className="field">
          <label className="condensed bold" htmlFor="session-cooldown">Entry Expires After : </label>
          <select className="condensed" name="cooldown" id="session-cooldown" ref={selectRef}>
            <option value="5">5 minutes</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
          </select>
        </div>


        <div className="additional-info">
          <h2 className="condensed bold">Additional Info</h2>
          <div>
            {
              Object.keys(fields).length > 0 ?
                <ul>
                  {Object.keys(fields).map(key => (
                    <li key={key}>
                      <span className="key condensed bold">{key}:</span>
                      <span className="value">{fields[key]}</span>
                      <TrashIcon onClick={() => removeField(key)} />
                    </li>))}
                </ul>
                : <p className="condensed">No additional info added...</p>
            }

            <form onSubmit={addField} ref={formRef}>
              <input className="condensed bold" type="text" name="key" id="key" placeholder='Key' />
              <span className="condensed bold">:</span>
              <input type="text" name="value" id="value" placeholder='Value' />
              <button className="fill" type='submit'>Add</button>
            </form>
          </div>
        </div>
      </legend>

      <div className="button-container">
        <button className="stroke" onClick={() => onSubmit(null)}>Back</button>
        <button className="fill" onClick={handleSubmit}>Create</button>
      </div>
    </div>
  )
}

export default SessionCreate;