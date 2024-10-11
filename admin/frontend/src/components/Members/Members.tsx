import { useContext, useEffect, useState } from 'react';
import MemberList from './MemberList';
import MemberView from './MemberView';
import MemberCreate from './MemberCreate';
import TokenContext from '../../assets/TokenContext';

interface Member {
  _id: string;
  name: string;
};

const fetchUrl = 'http://127.0.0.1:8000/members';
const addUrl = 'http://127.0.0.1:8000/members';

function Members({reLogin}: {reLogin: () => void}) {
  // app state
  const [app, changeApp] = useState('/loading');
  const token = useContext(TokenContext);
  
  // members data
  const [membersData, setMembersData] = useState<Member[]>([]);
  const [viewData, setViewData] = useState(null);
  
  const refreshMembers = () => {
    const fetchMembers = async () => {
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
    
    const formData = new FormData();
    formData.append("_id", data._id)
    formData.append("name", data.name)
    formData.append("password", data.password)
    formData.append("additional_info", JSON.stringify(data.additional_info))
    formData.append("image", data.image)
    
    const response = await fetch(addUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData
    });
    
    if (response.ok) {
      refreshMembers();
      changeApp('/list');
    } else if (response.status == 401) {
      reLogin();
    } else if (response.status == 409 || response.status == 406) {
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
      refreshMembers();
      changeApp("/list");
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
  
  let title, content;
    switch (app) {
      case '/loading':
        title = "Members";
        content = <p className="loading condensed">Loading...</p>
        break;
      case '/list':
        title = "Members";
        content = <MemberList members={membersData} onCreate={() => changeApp('/create')} onView={handleViewRequest} onDelete={handleDelete} />
        break;
      case '/create':
        title = "Add new member";
        content = <MemberCreate onSubmit={handleSubmit} />
        break;
      case '/view':
        title = "Member details";
        content = <MemberView data={viewData} onBack={() => changeApp('/list')} onUpdate={(_id, payload) => console.log(_id, payload)} />
    }
  
  return (
    <div className="members">
      <h1 className='condensed bold'>{title}</h1>
      {content}
    </div>
  );
};

export default Members;