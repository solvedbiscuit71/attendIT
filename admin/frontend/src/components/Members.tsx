import { useEffect, useState } from 'react';
import "./Members.css";
import MemberList from './Members/MemberList';
import MemberView from './Members/MemberView';
import MemberCreate from './Members/MemberCreate';

interface Member {
  _id: string;
  name: string;
};

const fetchUrl = 'http://127.0.0.1:8000/members';
const addUrl = 'http://127.0.0.1:8000/members';

function Members({reLogin}: {reLogin: () => void}) {
  // app state
  const [app, changeApp] = useState('/loading');
  
  // members data
  const [membersData, setMembersData] = useState<Member[]>([]);
  const [viewData, setViewData] = useState(null);
  
  const refreshMembers = () => {
    const fetchMembers = async () => {
      const token = document.cookie.split('=')[1];
      const response = await fetch(fetchUrl, {
          headers: {
              'Authorization': `Bearer ${token}`,
          },
      });
      
      if (response.ok) {
        const data = await response.json()
        setMembersData(data);
        changeApp('/list');
      } else if (response.status == 401) {
        reLogin();
      } else {
        const error = await response.json();
        console.error("Error:", error)
      }
    };

    fetchMembers();
  };
  
  useEffect(refreshMembers, []);
  
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
      refreshMembers();
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
    } else if (response.status == 401) {
      reLogin();
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
      refreshMembers();
      changeApp("/list");
    } else if (response.status == 401) {
      reLogin();
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
        content = <MemberList members={membersData} onCreate={() => changeApp('/create')} onView={handleViewRequest} />
        break;
      case '/create':
        content = <MemberCreate onSubmit={handleSubmit} />
        break;
      case '/view':
        content = <MemberView data={viewData} onBack={() => changeApp('/list')} onDelete={handleDelete} />
    }
  
  return (
    <div className="members">
      <h1>Members</h1>
      {content}
    </div>
  );
};

export default Members;