import { useState, useRef } from "react";

function MemberCreate({onSubmit}: {onSubmit: (data: any) => void}) {
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [passwd, setPasswd] = useState('')
  const [fields, setFields] = useState<any>({})
  const [file, setFile] = useState<File | null>(null);
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
    
    if (file === null) {
      return;
    }
    
    const data = {
      _id: id.toUpperCase(),
      name: name,
      password: passwd,
      additional_info: fields,
      image: file
    }
    onSubmit(data)
  }

  return (
    <div className="member-create">
      <div className="member-field">
        <label htmlFor="member-create-id">ID : </label>
        <input type="text" id='member-create-id' value={id.toUpperCase()} onChange={(e) => setId(e.target.value)} />
      </div>
      <div className="member-field">
        <label htmlFor="member-create-name">Name : </label>
        <input type="text" id='member-create-name' value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="member-field">
        <label htmlFor="member-create-pwd">Password : </label>
        <input type="password" id='member-create-pwd' value={passwd} onChange={(e) => setPasswd(e.target.value)} />
      </div>
      
      <div className="member-field">
        <label htmlFor="member-create-image">Photo : </label>
        <input type="file" name="image" id="member-create-image" onChange={(e) => setFile(e.target.files && e.target.files?.length > 0 ? e.target.files[0] : null)} required />
      </div>
      
      {file && <img className="member-image" src={URL.createObjectURL(file)} alt="Member Photo" />}

      
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

export default MemberCreate;