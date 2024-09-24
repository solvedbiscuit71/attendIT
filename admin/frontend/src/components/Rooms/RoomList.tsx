import { useState } from "react";

interface Room {
  _id: string;
};

function RoomList({rooms, onCreate}: {rooms: Room[], onCreate: () => void}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = rooms.filter(room =>
    room._id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const errorMessage = rooms.length == 0 ? "No room available..." : "No match found..."

  return (
    <>
      <div className="header">
        <input
          type="text"
          placeholder="Filter rooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="new-button" onClick={onCreate}>New</button>
      </div>
      <ul className="list">
        {filteredRooms.length > 0 ? filteredRooms.map(room => <li key={room._id}><a>{room._id}</a></li>) : <p>{errorMessage}</p>}
      </ul>
    </>
  )
}

export default RoomList;