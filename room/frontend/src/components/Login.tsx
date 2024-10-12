import React, { useRef } from 'react';
import Title from './Title';
import { RoomIcon } from '../assets/Icons';
import Credit from './Credit';

interface Props {
    onLogin: (name: string, token: string) => void;
}

const url = 'http://127.0.0.1:8001/login'

function Login({onLogin: LoggedIn}: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (formRef.current) {
      const formData = {
        username: formRef.current.elements.namedItem('username') as HTMLInputElement,
        password: formRef.current.elements.namedItem('password') as HTMLInputElement,
      }
      
      const body = {
        username: formData.username.value.toUpperCase(),
        password: formData.password.value
      }
      formRef.current.reset()
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body)
        });

        if (response.ok) {
          const result = await response.json();
          LoggedIn(body.username, result.access_token)
        } else if (response.status == 401) {
          alert("Invalid password");
        } else if (response.status == 404) {
          alert("Invalid username");
        } else {
          const error = await response.json();
          console.error("Error:", error)
        }
        
      } catch (error) {
        console.error("Network error:", error)
      }
      
    }
  }

  return (
    <div className="login">
      <div className='form'>
        <Title/>
        <RoomIcon/>
        <form onSubmit={handleLogin} ref={formRef}>
          <legend>
            <div>
              <label className='condensed bold' htmlFor="username">Name</label>
              <input className='condensed bold' type="text" id="username" name="username" placeholder='AB1-101' required />
            </div>

            <div>
              <label className='condensed bold' htmlFor="password">Password</label>
              <input className='condensed' type="password" id="password" name="password" placeholder='*******' required />
            </div>
          </legend>
          <div className='button-container'>
            <button className='condensed bold stroke' type="reset">Reset</button>
            <button className='condensed bold fill' type="submit">Login</button>
          </div>
        </form>
      </div>

      <Credit/>
    </div>
  )
}

export default Login;
