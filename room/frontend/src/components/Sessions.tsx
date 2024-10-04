import { useContext, useEffect, useState } from 'react';
import SessionList from './Session/SessionList';
import SessionCreate from './Session/SessionCreate';

import TokenContext from '../assets/TokenContext';
import "./Sessions.css"

interface SessionType {
  onGoing: { _id: string; timestamp: string; } | null;
  history: {  _id: string; timestamp: string; }[]
};

interface MemberType {
  _id: string;
  name: string;
  ongoing_session_id: string | null;

  selected: boolean;
};

const fetchUrl = 'http://127.0.0.1:8001/sessions';
const memberUrl = 'http://127.0.0.1:8001/members';
const addUrl = 'http://127.0.0.1:8001/sessions';

function Sessions({reLogin}: {reLogin: () => void}) {
  // app state
  const [app, changeApp] = useState('/loading');
  const token = useContext(TokenContext);
  
  // members data
  const [sessionData, setSessionData] = useState<SessionType | null>(null);
  const [memberData, setMemberData] = useState<MemberType[] | null>(null);
  const [viewData, setViewData] = useState(null);
  
  const refreshSessions = () => {
    const fetchSessions = async () => {
      const response = await fetch(fetchUrl, {
          headers: {
              'Authorization': `Bearer ${token}`,
          },
      });
      
      if (response.ok) {
        const data = await response.json()
        setSessionData(data);
        changeApp('/list');
      } else if (response.status == 401) {
        reLogin();
      } else {
        const error = await response.json();
        console.error("Error:", error)
      }
    };

    fetchSessions();
  };
  
  useEffect(refreshSessions, []);
  
  const handleSubmit = async (data: any) => {
    if (data == null) {
      changeApp('/list');
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
      refreshSessions();
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
  
  const handleCreate = async () => {
    const response = await fetch(memberUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    if (response.ok) {
      const data = await response.json();
      setMemberData(data);
      changeApp("/create");
    } else if (response.status == 401) {
      reLogin();
    } else {
      const error = await response.json();
      console.error("Error:", error);
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
      changeApp("/view");
    } else if (response.status == 401) {
      reLogin();
    } else {
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
      refreshSessions();
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
        if (sessionData)
          content = <SessionList sessions={sessionData} onCreate={handleCreate} onView={() => {}} />
        break;
      case '/create':
        if (memberData)
          content = <SessionCreate onSubmit={handleSubmit} membersData={memberData} />
        break;
      case '/view':
    }
  
  return (
    <div className="sessions">
      <h1>Sessions</h1>
      {content}
    </div>
  );
};

export type { SessionType, MemberType };
export default Sessions;