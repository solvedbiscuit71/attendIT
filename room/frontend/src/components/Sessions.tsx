import { useEffect, useState } from 'react';
import "./Sessions.css"
import SessionList from './Session/SessionList';

interface SessionType {
  onGoing: { timestamp: string; } | null;
  history: { timestamp: string; }[]
};

const fetchUrl = 'http://127.0.0.1:8001/sessions';
const addUrl = 'http://127.0.0.1:8001/sessions';

function Sessions({reLogin}: {reLogin: () => void}) {
  // app state
  const [app, changeApp] = useState('/loading');
  
  // members data
  const [sessionData, setSessionData] = useState<SessionType | null>(null);
  const [viewData, setViewData] = useState(null);
  
  const refreshSessions = () => {
    const fetchSessions = async () => {
      const token = document.cookie.split('=')[1];
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
      refreshSessions();
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
        if (sessionData)
          content = <SessionList sessions={sessionData} onCreate={() => {}} onView={() => {}} />
        break;
      case '/create':
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

export default Sessions;