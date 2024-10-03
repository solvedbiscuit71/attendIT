import { useState } from "react";
import "./App.css"
import Login from "./components/Login";
import { HomeIcon, LogoutIcon, RoomsIcon, SessionIcon } from "./assets/Icons";

const refreshTimeout = 10 * 60 * 1000; // 10 minutes
const refreshUrl = 'http://127.0.0.1:8001/token/refresh';

function Hero() {
  return (
    <div className="hero">
      <h1>Welcome to AttendIT's Room Portal</h1>
      <p>Delegating attendance to the attendees.</p>
      
      <img src="/classroom.jpeg" alt="A Image of a classroom" />
    </div>
  )
}

function App() {
  const [app, changeApp] = useState('/login');
  const [roomId, changeRoomId] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);
  
  const onLogin = (name: string) => {
    const id = setTimeout(refreshToken, refreshTimeout);

    setRefreshCount(id);
    changeRoomId(name);
    changeApp('/home');
  }
  
  const logout = () => {
      document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      changeApp('/login');
      clearInterval(refreshCount);
      setRefreshCount(0);
  }
  
  const refreshToken = async () => {
    const token = document.cookie.split('=')[1];
    const response = await fetch(refreshUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      document.cookie = `token=${result.access_token}`;
      
      const id = setTimeout(refreshToken, refreshTimeout);
      setRefreshCount(id);
    } else if (response.status == 401) {
      logout();
    } else {
      const error = await response.json();
      console.error("Error:", error)
    }
  }
  
  if (app == '/login') {
    return <Login onLogin={onLogin}/>
  } else {
    let content;
    
    switch (app) {
      case '/home':
        content = <Hero/>
        break;
      case '/sessions':
        break;
    }
    
    return (
      <div className="container">
        <nav className="navbar">
          <ul>
            <li onClick={_ => changeApp('/home')}><a><HomeIcon/>Home</a></li>
            <li onClick={_ => changeApp('/rooms')}><a><SessionIcon/>Sessions</a></li>
          </ul>
          
          <ul>
            <li className="no-hover"><a style={{alignItems: 'center'}}><RoomsIcon/>{roomId}</a></li>
            <li onClick={logout}><a><LogoutIcon/>Logout</a></li>
          </ul>
        </nav>
        <main className="content">
          {content}
        </main>
      </div>
    )
  }
}

export default App;
