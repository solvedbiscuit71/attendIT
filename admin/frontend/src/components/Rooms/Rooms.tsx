import { useContext, useEffect, useState } from 'react';
import RoomCreate from './RoomCreate';
import RoomList from './RoomList';
import RoomView from './RoomView';
import TokenContext from '../../assets/TokenContext';

interface Room {
  _id: string;
};

const fetchUrl = 'http://127.0.0.1:8000/rooms';
const addUrl = 'http://127.0.0.1:8000/rooms';

function Rooms({reLogin}: {reLogin: () => void}) {
  const [roomsData, setRoomsData] = useState<Room[]>([]);
  const [state, setState] = useState('/loading');
  const [viewData, setViewData] = useState(null);
  const token = useContext(TokenContext);
  
  const refreshRooms = () => {
    const fetchRooms = async () => {
      const response = await fetch(fetchUrl, {
          headers: {
              'Authorization': `Bearer ${token}`,
          },
      });
      
      if (response.ok) {
        const data = await response.json()
        setRoomsData(data);
        setState('/list');
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
      setState('/list');
      return;      
    }
    
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
      setState('/list');
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
    const response = await fetch(fetchUrl + `/${_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    if (response.ok) {
      const data = await response.json();
      setViewData(data);
      setState("/view");
    } else if (response.status == 401) {
      reLogin();
    } 
    else {
      const error = await response.json();
      console.error("Error:", error);
    }
  }
  
  const handleDelete = async (_id: string) => {
    const response = await fetch(fetchUrl + `/${_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      method: "DELETE",
    })
    
    if (response.ok) {
      refreshRooms();
      setState("/list");
    } else if (response.status == 401) {
      reLogin();
    } else if (response.status == 400 || response.status == 404) {
      const error = await response.json();
      alert(error['message'])
    } else {
      const error = await response.json();
      console.error("Error:", error);
    }
  }
  
  const handleUpdate = async (_id: string, data: any) => {
    const response = await fetch(fetchUrl + `/${_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: "PATCH",
      body: JSON.stringify(data),
    })
    
    if (response.ok) {
      alert('Room details updated')
    } else if (response.status == 401) {
      reLogin();
    } else if (response.status == 404) {
      const error = await response.json();
      alert(error['message'])
    } else {
      const error = await response.json();
      console.error("Error:", error);
    }

  }
  
  let title, content;
    switch (state) {
      case '/loading':
        title = "Rooms";
        content = <p className="loading condensed">Loading...</p>
        break;
      case '/list':
        title = "Rooms";
        content = <RoomList rooms={roomsData} onCreate={() => setState('/create')} onView={(_id) => handleViewRequest(_id)} onDelete={handleDelete} />
        break;
      case '/create':
        title = "Create new room";
        content = <RoomCreate onSubmit={handleSubmit}/>
        break;
      case '/view':
        title = "Room details";
        content = <RoomView data={viewData} onBack={() => setState('/list')} onUpdate={handleUpdate} />
    }
  
  return (
    <div className="rooms">
      <h1 className="condensed bold">{title}</h1>
      {content}
    </div>
  );
};

export default Rooms;