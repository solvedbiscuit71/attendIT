import { useState, useRef } from "react";
import { MemberType } from "../Sessions";


function SessionCreate({onSubmit, membersData}: {onSubmit: (data: any) => void, membersData: MemberType[]}) {
  const [fields, setFields] = useState<any>({});
  const [members, setMembers] = useState<MemberType[]>(membersData);
  const formRef = useRef<HTMLFormElement>(null);
  
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
  
  const handleSubmit = () => {
    const data = {
      additional_info: fields,
      member_ids: members.filter(member => member.selected).map(member => member._id)
    }
    onSubmit(data)
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
    <div className="session-create">
      <h2>Participants</h2>
      
      {
        members.length > 0 ?
          <ul className="participants">
            {members.map(member => 
            <li key={member._id}>
            <div className="member">
              <input type="checkbox" onClick={() => handleCheck(member._id)} disabled={member.ongoing_session_id !== null} />
              <div>
                <div>{member._id}</div>
                <div>{member.name}</div>
              </div>
            </div>
            </li>)}
          </ul>
        : <p>No members avialable...</p>
      }
      
      <h2>Additional Info</h2>
      
      {
        Object.keys(fields).length > 0 &&
        <ul>
          {Object.keys(fields).map(key => <li key={key}><span>{key}</span> : "{fields[key]}"</li>)}
        </ul>
      }
      
      <form onSubmit={addField} ref={formRef}>
        <input type="text" name="key" id="key" placeholder='Name' />
        <span>:</span>
        <input type="text" name="value" id="value" placeholder='Value' />
        <button className="button" type='submit'>Add</button>
      </form>
      
      <button className="button red" onClick={() => onSubmit(null)}>Cancel</button>
      <button className="button" onClick={handleSubmit}>Submit</button>
    </div>
  )
}

export default SessionCreate;