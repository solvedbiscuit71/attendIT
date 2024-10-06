import { useState, useRef } from "react";

function RoomCreate({onSubmit}: {onSubmit: (data: any) => void}) {
  const [name, setName] = useState('')
  const [passwd, setPasswd] = useState('')
  const [fields, setFields] = useState<any>({})
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
  
  const handleSubmit = async () => {
    // if (name.length < 5 || passwd.length < 8) return;
    
    const data = {
      _id: name.toUpperCase(),
      password: passwd,
      additional_info: fields
    }
    onSubmit(data)
  }

  return (
    <div className="room-create">
      <div className="room-field">
        <label htmlFor="room-create-name">Name : </label>
        <input type="text" id="room-create-name" value={name.toUpperCase()} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="room-field">
        <label htmlFor="room-create-pwd">Password : </label>
        <input type="password" id="room-create-pwd" value={passwd} onChange={(e) => setPasswd(e.target.value)} />
      </div>

      
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
        <button type='submit'>Add</button>
      </form>
      
      <button className="red-button" onClick={() => onSubmit(null)}>Cancel</button>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  )
}

export default RoomCreate;