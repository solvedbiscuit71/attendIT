import { useEffect, useState, useRef } from "react";
import { BatchesIcon as MembersIcon, HomeIcon, LogoutIcon, RoomsIcon } from "./assets/Icons";

import Login from "./components/Login";
import Rooms from "./components/Rooms";
import Members from "./components/Members";

import TokenContext from "./assets/TokenContext";
import "./App.css"

const refreshUrl = 'http://127.0.0.1:8000/token/refresh';

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

function Hero() {
  return (
    <div className="hero">
      <h1>Welcome to AttendIT's Admin Portal</h1>
      <p>Delegating attendance to the attendees.</p>
      
      <img src="/classroom.jpeg" alt="A Image of a classroom" />
    </div>
  )
}

function App() {
  const [app, changeApp] = useState('/login');
  const [token, setToken] = useState('');
  
  const onLogin = (newToken: string) => {
    setToken(newToken);
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
      case '/rooms':
        content = <Rooms reLogin={onLogout}/>
        break;
      case '/members':
        content = <Members reLogin={onLogout}/>
        break;
    }
    
    return (
      <TokenContext.Provider value={token}>
        <div className="container">
          <nav className="navbar fixed">
            <ul>
              <li onClick={_ => changeApp('/home')}><a><HomeIcon/> Home</a></li>
              <li onClick={_ => changeApp('/rooms')}><a><RoomsIcon/> Rooms</a></li>
              <li onClick={_ => changeApp('/members')}><a><MembersIcon/> Members</a></li>
            </ul>
            
            <ul>
              <li onClick={onLogout}><a><LogoutIcon/> Logout</a></li>
            </ul>
          </nav>
          <main className="content">
            {content}
          </main>
        </div>
      </TokenContext.Provider>
    )
  }
}

export default App;
