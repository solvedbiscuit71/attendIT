import { useState } from "react";
import { MemberIcon } from "../../assets/Icons";

interface Member {
  _id: string;
  name: string;
};

function MemberList({members, onCreate, onView}: {members: Member[], onCreate: () => void, onView: (name: string) => void}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = members.filter(member =>
    member._id.toLowerCase().includes(searchTerm.toLowerCase()) || member.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (a._id < b._id) return -1;
    else if (a._id > b._id) return 1;
    else return 0;
  });
  const errorMessage = members.length == 0 ? "No member available..." : "No match found..."

  return (
    <>
      <div className="header">
        <input
          type="text"
          placeholder="Filter members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="new-button" onClick={onCreate}>New</button>
      </div>
      <ul className="list">
        {filteredRooms.length > 0 ? filteredRooms.map(member => <li key={member._id}>
          <a onClick={_ => onView(member._id)}>
            <MemberIcon/>
            <div>
              <div className="member-id">{member._id}</div>
              <div>{member.name}</div>
            </div>
          </a></li>) : <p>{errorMessage}</p>}
      </ul>
    </>
  )
}

export default MemberList;