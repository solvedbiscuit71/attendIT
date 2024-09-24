// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import React, { useRef } from 'react';
import './App.css'

const url = 'http://127.0.0.1:8000/login'

function App() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (formRef.current) {
      const formData = {
        username: formRef.current.elements.namedItem('username') as HTMLInputElement,
        password: formRef.current.elements.namedItem('password') as HTMLInputElement,
      }
      
      const body = {
        username: formData.username.value,
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
          // TODO: document.cookie = `token=${result.access_token}; Secure; HttpOnly`;
          document.cookie = `token=${result.access_token}; HttpOnly`;
          console.log("Login Successfully", result.access_token)
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
            <input type="text" id="username" name="username" value="admin" disabled required />

            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
            <button type="submit">Login</button>
          </form>
        </div>
      </main>
  )
}

export default App;
