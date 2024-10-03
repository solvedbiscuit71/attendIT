import { useState } from "react";
import { BatchesIcon as MembersIcon, HomeIcon, LogoutIcon, RoomsIcon } from "./assets/Icons";
import Login from "./components/Login";
import Rooms from "./components/Rooms";
import "./App.css"
import Members from "./components/Members";

const refreshTimeout = 10 * 60 * 1000; // 10 minutes
const refreshUrl = 'http://127.0.0.1:8000/token/refresh';

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
  const [refreshCount, setRefreshCount] = useState(0);
  
  const onLogin = () => {
    changeApp('/home');

    const id = setTimeout(refreshToken, refreshTimeout);
    setRefreshCount(id);
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
      case '/rooms':
        content = <Rooms reLogin={logout}/>
        break;
      case '/members':
        content = <Members reLogin={logout}/>
        break;
    }
    
    return (
      <div className="container">
        <nav className="navbar">
          <ul>
            <li onClick={_ => changeApp('/home')}><a><HomeIcon/> Home</a></li>
            <li onClick={_ => changeApp('/rooms')}><a><RoomsIcon/> Rooms</a></li>
            <li onClick={_ => changeApp('/members')}><a><MembersIcon/> Members</a></li>
          </ul>
          
          <ul>
            <li onClick={logout}><a><LogoutIcon/> Logout</a></li>
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