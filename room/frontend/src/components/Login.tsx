import React, { useRef } from 'react';
import './Login.css'

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
      <main>
        <div className="login-card">
          <h2>Login</h2>
          <form onSubmit={handleLogin} ref={formRef}>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" onChange={(e) => {e.target.value = e.target.value.toUpperCase()}} required />

            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
            <button type="submit">Login</button>
          </form>
        </div>
      </main>
  )
}

export default Login;
