import { useState, useRef } from "react";
import { TrashIcon } from "../../assets/Icons";

interface Params {
  data: any;
  onBack: () => void;
  onUpdate: (_id: string, data: any) => void;
}

export default function MemberView({ data, onBack, onUpdate }: Params) {
  const [name, setName] = useState(data.name)
  const [passwd, setPasswd] = useState('')
  const [fields, setFields] = useState<any>(data.additional_info)
  const [file, setFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleUpdate = async () => {
    if (passwd.length > 0 && passwd.length < 5) return;

    const payload = {
      name: (name.length == 0 || (name == data.name)) ? null : name,
      password: passwd.length == 0 ? null : passwd,
      image: file,
      additional_info: fields,
    }
    onUpdate(data._id, payload);
   
    setPasswd('');
  }

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
    setFields((fields: any) => Object.keys(fields).filter(key => key !== toRemove)
      .reduce((obj, key) => {
          //@ts-ignore
          obj[key] = fields[key];
          return obj;
      }, {})
    );
  }

  return (
    <div className="room-create room-view member-create">
      <legend>
        <h1 className="condensed bold">
        <span> ID: {data._id} </span>
        {data.ongoing_session_id !== null ? <span className="badge">Ongoing</span> : undefined}
        </h1>
        <div className="input-container">
          <div className="inputs">
            <div className="field">
              <label className="condensed bold" htmlFor="room-create-name">Name</label>
              <input className="condensed" placeholder="Enter name..." type="text" id="room-create-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label className="condensed bold" htmlFor="room-create-pwd">Password</label>
              <input className="condensed" placeholder="Enter new password..." type="password" id="room-create-pwd" value={passwd} onChange={(e) => setPasswd(e.target.value)} />
            </div>
            <div className="field">
              <label className="condensed bold" htmlFor="member-create-image">Photo</label>
              <input type="file" name="image" id="member-create-image" onChange={(e) => setFile(e.target.files && e.target.files?.length > 0 ? e.target.files[0] : null)} required />
            </div>
          </div>
          <div className="image">
            {file && <img className="member-image" src={URL.createObjectURL(file)} alt="Member Photo" />}
          </div>
        </div>

        <div>
        <h2>Additional Info</h2>
        <div>
          <ul>
            {
              Object.keys(fields).length > 0 ?
              Object.keys(fields).map(key => (
                <li key={key}>
                  <span className="key condensed bold">{key}:</span>
                  <span className="value">{fields[key]}</span>
                  <TrashIcon onClick={() => removeField(key)}/>
                </li>))
              : <p className="condensed">No additional info...</p>
            }
          </ul>
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
        <button className="stroke" onClick={onBack}>Back</button>
        <button className="fill" onClick={handleUpdate}>Update</button>
      </div>
    </div>
  )
}