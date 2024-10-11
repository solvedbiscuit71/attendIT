import { useState, useRef } from "react";
import { TrashIcon } from "../../assets/Icons";

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
      
      if (formData.key.length == 0 || formData.value.length == 0) return;
      
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
  
  const handleSubmit = async () => {
    if (name.length < 5 || passwd.length < 5) return;
    
    const data = {
      _id: name.toUpperCase(),
      password: passwd,
      additional_info: fields
    }
    onSubmit(data)
  }

  return (
    <div className="room-create">
      <legend>
        <div className="field">
          <label className="condensed bold" htmlFor="room-create-name">Name</label>
          <input className="condensed" placeholder="AB1-101" type="text" id="room-create-name" value={name.toUpperCase()} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label className="condensed bold" htmlFor="room-create-pwd">Password</label>
          <input className="condensed" placeholder="*******" type="password" id="room-create-pwd" value={passwd} onChange={(e) => setPasswd(e.target.value)} />
        </div>

        
        <div>
          <h2 className="condensed bold">Additional Info</h2>
          <div>
            {
              Object.keys(fields).length > 0 ?
              <ul>
                {Object.keys(fields).map(key => (
                <li key={key}>
                  <span className="key condensed bold">{key}:</span>
                  <span className="value">{fields[key]}</span>
                  <TrashIcon onClick={() => removeField(key)}/>
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
        <button className="fill" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  )
}

export default RoomCreate;