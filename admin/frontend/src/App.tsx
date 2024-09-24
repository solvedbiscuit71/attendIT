import { useState } from "react";
import Login from "./components/Login";
import "./App.css"
import Rooms from "./components/Rooms";

function App() {
  const [app, changeApp] = useState('/login');
  
  const onLogin = () => {
    changeApp('/home');
  }
  
  if (app == '/login') {
    return <Login onLogin={onLogin}/>
  } else {
    let content;
    
    switch (app) {
      case '/home':
        content = <h1 style={{padding: '20px'}}>Welcome admin</h1>
        break
      case '/rooms':
        content = <Rooms reLogin={() => changeApp('/login')}/>
    }
    
    return (
      <div className="container">
        <nav className="navbar">
          <ul>
            <li onClick={_ => changeApp('/home')}><a>Home</a></li>
            <li onClick={_ => changeApp('/rooms')}><a>Rooms</a></li>
            <li onClick={_ => changeApp('/batches')}><a>Batches</a></li>
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