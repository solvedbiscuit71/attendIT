import { useState } from "react";
import { TrashIcon } from "../../assets/Icons";

interface Params {
  members: {
    _id: string;
    name: string;
  }[];
  onCreate: () => void;
  onView: (name: string) => void;
  onDelete: (_id: string) => void;
}

function MemberList({members, onCreate, onView, onDelete}: Params) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter(member =>
    member._id.toLowerCase().includes(searchTerm.toLowerCase()) || member.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (a._id < b._id) return -1;
    else if (a._id > b._id) return 1;
    else return 0;
  });
  const errorMessage = members.length == 0 ? "No member available..." : "No match found..."

  return (
    <div className="room-list member-list">
      <div className="filter">
        <input
          type="text"
          placeholder="Filter members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="condensed fill" onClick={onCreate}>New</button>
      </div>
      
      {filteredMembers.length > 0 ? (
        <ul>
          {filteredMembers.map(member => (
            <li key={member._id}>
              <a className="condensed" onClick={_ => onView(member._id)}>
                <span className="bold">{member._id}</span>
                <span>{member.name}</span>
              </a>
              <TrashIcon onClick={() => onDelete(member._id)}/>
            </li>))}
        </ul>
      ) : <p className="condensed">{errorMessage}</p>}
    </div>
  )
}

export default MemberList;