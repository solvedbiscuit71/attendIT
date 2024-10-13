import React, { useState, useEffect } from "react";
import { Text, View, SafeAreaView, StyleSheet, StatusBar, ScrollView, Image, TouchableOpacity, Platform } from "react-native";

import QRcodeScanner from "@/components/QRcodeScanner";
import Login from "@/components/Login";

import * as SecureStore from 'expo-secure-store';
import FaceScanner from "@/components/FaceScanner";

async function save(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

async function getValueFor(key: string) {
  const result = await SecureStore.getItemAsync(key);
  return result;
}

interface Checkpoint {
  name: string;
  expires_at: string;
  completed: boolean;
}

interface MemberCheckpoints {
  checkpoints: Checkpoint[];
  ongoing: boolean;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null)
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [memberCheckpoints, setMemberCheckpoints] = useState<MemberCheckpoints | null>(null);
  const [cameraOn, setCameraOn] = useState<boolean>(false);
  const [checkpointId, setCheckpointId] = useState<string | null>(null);
  
  const onQRcodeScanned = async (type: any, data: any) => {
    try {
      const response = await fetch(`${data}/validate`);
      if (response.ok) {
        save('session_url', data);
        setSessionUrl(data);
        return 'Success';
      } else if (response.status == 404 || response.status == 406) {
        const error = await response.json()
        return 'Invalid QRCode';
      } else {
        const error = await response.json()
        return 'Internal Error';
      }
    } catch(error) {
      return "Ensure you're connected to the Gateway";
    }
  }
  
  const onLoggedIn = (access_token: string, name: string) => {
    save('access_token', access_token);
    save('member_name', name);

    setToken(access_token);
    setName(name);
    
    if (sessionUrl) {
      loadingCheckpoints(sessionUrl, access_token);
    }
  }
  
  const onLogout = () => {
    save('access_token', '');
    save('member_info', '');
    save('session_url', '');
    
    setSessionUrl(null);
    setToken(null);
    setName(null);
  }
  
  const onCameraTaken = async (checkpointId: string, photoUri: string | null) => {
    if (photoUri === null) {
      setCameraOn(false);
      setCheckpointId(null);
      return;
    }

    const formData = new FormData();
    formData.append("checkpoint_id", checkpointId);
    // @ts-ignore
    formData.append("image", {
        uri: photoUri,
        name: "unknown.jpeg",
        type: "image/jpeg",
    });
    const options = {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data; boundary=---011000010111000001101001',
        },
    };
    
    try {
      const response = await fetch(sessionUrl + '/member_checkpoints', options);
      
      if (response.ok) {
      } else if (response.status == 400) {
        const data = await response.json()
        alert(data["message"])
      } else if (response.status == 401) {
        onLogout();
      } else if (response.status == 406 || response.status == 403) {
        const data = await response.json()
        alert(data["message"]);
      } else {
        const error = await response.json();
        console.error("Error:", error)
      }

      // @ts-ignore
      loadingCheckpoints(sessionUrl, token);
      setCameraOn(false);
      setCheckpointId(null);
    } catch (error) {
      console.error("Network error:", error)
      console.error("URL:", sessionUrl + '/member_checkpoints')
      console.error("Access Token:", token)
    }
  }

  const loadingCheckpoints = async (url: string, access_token: string) => {
    try {
      const response = await fetch(url + '/member_checkpoints', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`
        },
      });

      if (response.ok) {
        const result = await response.json();
        setMemberCheckpoints(result);
      } else if (response.status == 401) {
        onLogout();
      } else {
        const error = await response.json();
        console.error("Error:", error)
      }
    } catch (error) {
      console.error("Network error:", error)
      console.error("URL:", sessionUrl + '/member_checkpoints')
      console.error("Access Token:", access_token)
    }
    
  }
  
  useEffect(() => {
    const checkExistingValue = async () => {
      const session_url = await getValueFor('session_url'); 

      const access_token = await getValueFor('access_token');
      const member_name = await getValueFor('member_name');

      if (session_url && session_url.length > 0) {
        setSessionUrl(session_url);
        if (access_token && access_token.length > 0 && member_name && member_name.length > 0) {
          setToken(access_token);
          setName(member_name);
          setTimeout(() => loadingCheckpoints(session_url, access_token), 0);
        }
      }
      setLoading(false);
    }
    
    checkExistingValue().catch(error => console.log(error));
  }, [])

  if (loading) {
    return <Text>Loading...</Text>
  }

  let content = null;
  if (sessionUrl === null) {
    content = <QRcodeScanner onScanned={onQRcodeScanned} />
  } else if (token === null) {
    content = <Login onBack={onLogout} onLogin={onLoggedIn} loginUrl={sessionUrl + '/login'} />
  } else if (cameraOn && checkpointId) {
    content = <FaceScanner checkpointId={checkpointId} onTaken={onCameraTaken} />
  } else {
    content = (
      <>
        <Image style={styles.image} source={require("../assets/images/classroom.jpg")} />
        <View style={styles.main}>
          <View style={styles.session}>
            <Text style={styles.h2}>Welcome, {name}</Text>
            {memberCheckpoints != null && !memberCheckpoints.ongoing && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Expired</Text>
            </View>)}
          </View>

          <View style={styles.listContainer}>
            { (memberCheckpoints == null || memberCheckpoints.checkpoints.length == 0) ? <Text>Loading...</Text> : memberCheckpoints?.checkpoints.map(checkpoint => {
              const now = new Date().getTime();
              const expires_at = new Date(checkpoint.expires_at).getTime();
              let status, color;
              if (checkpoint.completed) {
                status = "Completed";
                color = "#4CBB17";
              } else if (now < expires_at && memberCheckpoints.ongoing) {
                status = "Pending"
              } else {
                status = "Missed";
                color = "#ff4242";
              }
              return (
                <View style={styles.listItem} key={checkpoint.name}>
                  <View>
                    <Text style={{ ...styles.listText, fontWeight: 'bold', textDecorationLine: status == "Completed" ? 'line-through' : 'none' }}>{checkpoint.name}</Text>
                    <Text style={styles.listText}>{checkpoint.expires_at}</Text>
                  </View>
                  {
                    status != "Pending" ?
                      <Text style={{ ...styles.listText, color: color }}>{status}</Text>
                      : (<TouchableOpacity style={styles.miniButtonFill} onPress={() => { setCameraOn(true); setCheckpointId(checkpoint.name) }}>
                        <Text style={styles.miniButtonFillText}>Pending</Text>
                      </TouchableOpacity>)
                  }
                </View>
              )
            })}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonStroke} onPress={onLogout}>
              <Text style={styles.buttonStrokeText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonFill} onPress={() => loadingCheckpoints(sessionUrl, token)}>
              <Text style={styles.buttonFillText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    )
  }
  return (
    <>
      <StatusBar barStyle={'dark-content'} />
      <SafeAreaView style={styles.safearea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.h1}>Attend<Text style={styles.span}>IT</Text></Text>
              <Text style={styles.subtitle}>Delegating attendance to the attendees</Text>
            </View>

            <View style={styles.content}>
              {content}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
  },
  scrollView: {
    marginTop: Platform.select({ ios: 0, android: 24 }),
    flexGrow: 1
  },
  container: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  header: {
  },
  content: {
  },
  h1: {
    fontSize: Platform.select({ ios: 32, android: 22 }),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  span: {
    color: '#FF4C00',
  },
  subtitle: {
    fontSize: Platform.select({ ios: 18, android: 14 }),
    textAlign: 'center',
  },
  image: {
    width: '100%',
    marginVertical: 20
  },
  main: {
  },
  h2: {
    fontSize: Platform.select({ ios: 20, android: 18 }),
    fontWeight: 'bold',
  },
  session: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    backgroundColor: "#FF4C00",
    borderRadius: 4,
    padding: 5,
  },
  badgeText: {
    fontSize: Platform.select({ ios: 16, android: 14 }),
    fontWeight: 'bold',
    color: 'white',
  },
  listContainer: {
    marginVertical: 20,
    
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderColor: 'black',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },
  listText: {
    fontSize: Platform.select({ ios: 18, android: 14 }),
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  buttonStroke: {
    flexGrow: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#1174FF',
    paddingVertical: Platform.select({ios: 14, android: 10}),
    paddingHorizontal: 24,
  },
  buttonFill: {
    flexGrow: 1,
    borderRadius: 8,
    paddingVertical: Platform.select({ios: 14, android: 10}),
    paddingHorizontal: 24,
    backgroundColor: '#1174FF',
  },
  miniButtonFill: {
    borderRadius: 8,
    paddingVertical: Platform.select({ios: 10, android: 8}),
    paddingHorizontal: 12,
    backgroundColor: '#1174FF',
  },
  buttonStrokeText: {
    textAlign: 'center',
    color: '#1174FF',
    fontSize: Platform.select({ios: 18, android: 14}),
    fontWeight: 'bold',
  },
  buttonFillText: {
    textAlign: 'center',
    color: 'white',
    fontSize: Platform.select({ios: 18, android: 14}),
    fontWeight: 'bold',
  },
  miniButtonFillText: {
    textAlign: 'center',
    color: 'white',
    fontSize: Platform.select({ios: 18, android: 14}),
  },
})