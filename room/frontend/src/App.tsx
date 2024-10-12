import { useState, useEffect, useRef } from "react";
import { LogoutIcon } from "./assets/Icons";

import Login from "./components/Login";
import Sessions from "./components/sessions/Sessions";

import TokenContext from "./assets/TokenContext";
import Title from "./components/Title";
import Credit from "./components/Credit";
import Hero from "./components/Hero";

const refreshUrl = 'http://127.0.0.1:8001/token/refresh';

function useInterval(callback: any, delay: number) {
  const savedCallback = useRef<any>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function App() {
  const [app, changeApp] = useState('/login');
  const [token, setToken] = useState('');
  const [roomId, setRoomId] = useState('');
  
  const onLogin = (name: string, newToken: string) => {
    setToken(newToken);
    setRoomId(name);
    changeApp('/home');
  }
  
  const onLogout = () => {
    setToken('');
    changeApp('/login');
  }

  useInterval(() => {
    if (token.length === 0) return;
    fetch(refreshUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else if (response.status == 401) {
        onLogout();
      } 
      else {
        throw response.json();
      }
    })
    .then((data: any) => {
      setToken(data.access_token);
    })
    .catch(error => {
      console.error("Error:", error);
    });
  }, 10 * 60 * 1000); // 10 minutes  
  
  if (app == '/login') {
    return <Login onLogin={onLogin}/>
  } else {
    let content;
    
    switch (app) {
      case '/home':
        content = <Hero/>
        break;
      case '/sessions':
        content = <Sessions reLogin={onLogout}/>
        break;
    }
    
    return (
      <TokenContext.Provider value={token}>
        <div className="app">
          <nav>
            <h1 className="condensed bold" onClick={_ => changeApp('/home')}>Attend<span>IT</span></h1>
            <hr/>
            <h2 className="condensed bold">{roomId}</h2>
            <div className="list-container">
            <ul>
              <li onClick={_ => changeApp('/sessions')}>
                <a className={app == '/sessions' ? 'selected' : undefined}>Sessions</a>
              </li>
            </ul>
            
            <ul>
              <li onClick={onLogout}>
                <a>Logout</a>
                <LogoutIcon/>
              </li>
            </ul>
            </div>
          </nav>
          <main>
            <Title/>
            {content}
            <Credit/>
          </main>
        </div>
      </TokenContext.Provider>
    )
  }
}

export default App;
