import { useState } from "react";
import { BatchesIcon, HomeIcon, LogoutIcon, RoomsIcon } from "./assets/Icons";
import Login from "./components/Login";
import Rooms from "./components/Rooms";
import "./App.css"

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
  
  const onLogin = () => {
    changeApp('/home');
  }
  
  const logout = () => {
      document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      changeApp('/login');
  }
  
  if (app == '/login') {
    return <Login onLogin={onLogin}/>
  } else {
    let content;
    
    switch (app) {
      case '/home':
        content = <Hero/>
        break
      case '/rooms':
        content = <Rooms reLogin={() => changeApp('/login')}/>
    }
    
    return (
      <div className="container">
        <nav className="navbar">
          <ul>
            <li onClick={_ => changeApp('/home')}><a><HomeIcon/> Home</a></li>
            <li onClick={_ => changeApp('/rooms')}><a><RoomsIcon/> Rooms</a></li>
            <li onClick={_ => changeApp('/batches')}><a><BatchesIcon/> Batches</a></li>
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