import { useContext, useEffect, useState } from 'react';
import SessionList from './SessionList';
import SessionCreate from './SessionCreate';

import TokenContext from '../../assets/TokenContext';
import SessionView from './SessionView';

interface SessionListType {
  onGoing: { _id: string; timestamp: string; } | null;
  history: {  _id: string; timestamp: string; }[]
};

interface AttendeesType {
  member_id: string;
  entry: boolean;
  checkpoint_ids: any[];
};

interface CheckpointType {
  name: string;
  expires_at: string;
}

interface SessionViewType {
  room_id: string;
  session_id: string;
  session_url: string;
  timestamp: string;
  ongoing: boolean;
  checkpoints: CheckpointType[];
  attendees: AttendeesType[];
  additional_info: any;
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
  const [sessionData, setSessionData] = useState<SessionListType | null>(null);
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
  
  const handleCheckpoint = async (_id: string, data: any) => {
    const response = await fetch(fetchUrl + `/${_id}/checkpoint`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(data)
    })

    if (response.ok) {
      handleViewRequest(_id);
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
  
  const handleSecondary = async (_id: string, ongoing: boolean) => {
    const url = ongoing ? fetchUrl + `/${_id}/end` : fetchUrl + `/${_id}`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      method: ongoing ? "PATCH" : "DELETE",
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
  
  let title, content;
    switch (app) {
      case '/loading':
        title = "Sessions";
        content = <p style={{marginBlock: '20px'}}>Loading...</p>
        break;
      case '/list':
        if (sessionData) {
          title = "Sessions";
          content = <SessionList sessions={sessionData} onCreate={handleCreate} onView={handleViewRequest} />
        }
        break;
      case '/create':
        if (memberData) {
          title = "Create new session";
          content = <SessionCreate onSubmit={handleSubmit} membersData={memberData} />
        }
        break;
      case '/view':
        if (viewData) {
          title = "Session details";
          content = <SessionView data={viewData} onBack={() => changeApp("/list")} onSecondary={handleSecondary} onCheckpoint={handleCheckpoint} onRefresh={handleViewRequest} />
        }
        break;
    }
  
  return (
    <div className="rooms">
      <h1 className="condensed bold">{title}</h1>
      {content}
    </div>
  );
};

export type { SessionListType, SessionViewType, AttendeesType, MemberType };
export default Sessions;