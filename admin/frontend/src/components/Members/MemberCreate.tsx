import { useState, useRef } from "react";
import { TrashIcon } from "../../assets/Icons";

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
    if (id.length < 5 || passwd.length < 5 || file === null) return;
    
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
    <>
      <div className="room-create member-create">
        <legend>
        <div className="input-container">
          <div className="inputs">
            <div className="field">
              <label className="condensed bold" htmlFor="member-create-id">ID</label>
              <input className="condensed" placeholder="CSE22047" type="text" id="member-create-id" value={id.toUpperCase()} onChange={(e) => setId(e.target.value)} />
            </div>
            <div className="field">
              <label className="condensed bold" htmlFor="member-create-name">Name</label>
              <input className="condensed" placeholder="Praveen" type="text" id="member-create-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label className="condensed bold" htmlFor="member-create-pwd">Password</label>
              <input className="condensed" placeholder="*******" type="password" id="member-create-pwd" value={passwd} onChange={(e) => setPasswd(e.target.value)} />
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
    </>
  )
}

export default MemberCreate;