import { useEffect, useState } from 'react';
import RoomCreate from './Rooms/RoomCreate';
import RoomList from './Rooms/RoomList';
import "./Rooms.css"
import RoomView from './Rooms/RoomView';

interface Room {
  _id: string;
};

const fetchUrl = 'http://127.0.0.1:8000/rooms';
const addUrl = 'http://127.0.0.1:8000/rooms';

function Rooms({reLogin}: {reLogin: () => void}) {
  const [roomsData, setRoomsData] = useState<Room[]>([]);
  const [app, changeApp] = useState('/loading');
  const [viewData, setViewData] = useState(null);
  
  const refreshRooms = () => {
    const fetchRooms = async () => {
      const token = document.cookie.split('=')[1];
      const response = await fetch(fetchUrl, {
          headers: {
              'Authorization': `Bearer ${token}`,
          },
      });
      
      if (response.ok) {
        const data = await response.json()
        setRoomsData(data);
        changeApp('/list');
      } else if (response.status == 401) {
        reLogin();
      } else {
        const error = await response.json();
        console.error("Error:", error)
      }
    };

    fetchRooms();
  };
  
  useEffect(refreshRooms, []);
  
  const handleSubmit = async (data: any) => {
    if (data == null) {
      changeApp('/list');
      return;      
    }
    
    const token = document.cookie.split('=')[1];
    const response = await fetch(addUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (response.ok) {
      refreshRooms();
      changeApp('/list');
    } else if (response.status == 401) {
      reLogin();
    } else if (response.status == 409) {
      const error = await response.json();
      alert(error.message)
    } else {
      const error = await response.json();
      console.error("Error:", error)
    }
  }

  const handleViewRequest = async (_id: string) => {
    const token = document.cookie.split('=')[1];
    const response = await fetch(fetchUrl + `/${_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    if (response.ok) {
      const data = await response.json();
      setViewData(data);
      changeApp("/view");
    } else {
      const error = await response.json();
      console.error("Error:", error);
    }
  }
  
  const handleDelete = async (_id: string) => {
    const token = document.cookie.split('=')[1];
    const response = await fetch(fetchUrl + `/${_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      method: "DELETE",
    })
    
    if (response.ok) {
      refreshRooms();
      changeApp("/list");
    } else {
      const error = await response.json();
      console.error("Error:", error);
    }
    
  }
  
  let content;
    switch (app) {
      case '/loading':
        content = <p style={{marginBlock: '20px'}}>Loading...</p>
        break;
      case '/list':
        content = <RoomList rooms={roomsData} onCreate={() => changeApp('/create')} onView={(_id) => handleViewRequest(_id)} />
        break;
      case '/create':
        content = <RoomCreate onSubmit={handleSubmit}/>
        break;
      case '/view':
        content = <RoomView data={viewData} onBack={() => changeApp('/list')} onDelete={handleDelete} />
    }
  
  return (
    <div className="room-list">
      <h1>Rooms</h1>
      {content}
    </div>
  );
};

export default Rooms;