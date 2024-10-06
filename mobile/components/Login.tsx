import React, { useState } from "react";
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Platform } from "react-native";

interface MemberData {
  member_id: string;
  password: string;
};

interface Params {
  loginUrl: string;
  onLogin: (token: string, memberName: string) => void;
  onBack: () => void;
}

export type { MemberData };
export default function Login({loginUrl, onLogin, onBack}: Params) {
  const [memberId, setMemberId] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLoginRequest = async () => {
    if (memberId.length == 0 || password.length == 0) {
      alert("Enter username and password");
      return;
    }

    const body: MemberData = {
      member_id: memberId,
      password: password
    }
    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const result = await response.json();
        onLogin(result.access_token, result.member_info["name"])
      } else if (response.status == 401) {
        alert("Invalid username or password");
      } else if (response.status == 404) {
        alert("Invalid username");
      } else {
        const error = await response.json();
        console.error("Error:", error)
      }

    } catch (error) {
      console.error("Network error:", error)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.loginForm}>
        <View style={styles.loginField}>
          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} value={memberId} onChangeText={(text) => setMemberId(text)} />
        </View>

        <View style={styles.loginField}>
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={(text) => setPassword(text)} secureTextEntry={true} />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.red_button} onPress={onBack}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLoginRequest}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  loginForm: {
  },
  loginField: {
    marginBottom: 20,
  },
  label: {
    fontSize: Platform.select({ios: 18, android: 14}),
    marginBottom: 10,
  },
  input: {
    fontSize: Platform.select({ios: 18, android: 14}),
    padding: Platform.select({ios: 10, android: 5}),
    borderColor: 'black',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 4,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 20,
  },
  red_button: {
    backgroundColor: "#ff4242",
    borderRadius: 4,
    padding: 10,
    flexGrow: 1,
  },
  button: {
    backgroundColor: "#007BFF",
    borderRadius: 4,
    padding: 10,
    flexGrow: 1,
  },
  buttonText: {
    fontSize: Platform.select({ios: 18, android: 14}),
    textAlign: 'center',
    color: 'white',
  }
});