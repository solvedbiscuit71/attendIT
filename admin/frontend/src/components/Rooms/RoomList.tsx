import { useState } from "react";
import { TrashIcon } from "../../assets/Icons";

interface Params {
  rooms: {
    _id: string;
  }[];
  onCreate: () => void;
  onView: (name: string) => void;
  onDelete: (_id: string) => void;
}

function RoomList({rooms, onCreate, onView, onDelete}: Params) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = rooms.filter(room =>
    room._id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const errorMessage = rooms.length == 0 ? "No room available..." : "No match found..."

  return (
    <div className="room-list">
      <div className="filter">
        <input
          type="text"
          placeholder="Filter rooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="condensed fill" onClick={onCreate}>New</button>
      </div>
      
      {filteredRooms.length > 0 ? (
        <ul>
          {filteredRooms.map(room => (
            <li key={room._id}>
              <a className="bold" onClick={_ => onView(room._id)}>{room._id}</a>
              <TrashIcon onClick={() => onDelete(room._id)}/>
            </li>))}
        </ul>
      ) : <p className="condensed">{errorMessage}</p>}
    </div>
  )
}

export default RoomList;