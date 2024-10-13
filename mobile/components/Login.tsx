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
      } else if (response.status == 403) {
        alert("Access denied to session");
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
        <View style={styles.legend}>
          <View style={styles.loginField}>
            <Text style={styles.label}>Username</Text>
            <TextInput style={styles.input} value={memberId} onChangeText={(text) => setMemberId(text)} placeholder="CSE22047" />
          </View>

          <View style={styles.loginField}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={(text) => setPassword(text)} secureTextEntry={true} placeholder="*******" />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonStroke} onPress={onBack}>
            <Text style={styles.buttonStrokeText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonFill} onPress={handleLoginRequest}>
            <Text style={styles.buttonFillText}>Login</Text>
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
  },
  legend: {
    borderRadius: 4,
    borderColor: 'black',
    borderWidth: 1,
    borderStyle: 'solid',
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 20,

    flex: 1,
    gap: 20,
  },
  label: {
    fontSize: Platform.select({ios: 20, android: 18}),
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    fontSize: Platform.select({ios: 18, android: 14}),
    paddingVertical: Platform.select({ios: 10, android: 5}),
    paddingHorizontal: Platform.select({ios: 12, android: 8}),
    borderColor: 'black',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 4,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  buttonStroke: {
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#1174FF',
    paddingVertical: Platform.select({ios: 10, android: 6}),
    paddingHorizontal: 24,
  },
  buttonFill: {
    borderRadius: 8,
    paddingVertical: Platform.select({ios: 10, android: 6}),
    paddingHorizontal: 24,
    backgroundColor: '#1174FF',
  },
  buttonStrokeText: {
    color: '#1174FF',
    fontSize: Platform.select({ios: 18, android: 14}),
  },
  buttonFillText: {
    color: 'white',
    fontSize: Platform.select({ios: 18, android: 14}),
  },
});