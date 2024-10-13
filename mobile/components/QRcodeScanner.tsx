import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Platform } from "react-native";
import { CameraView, Camera } from "expo-camera";

const REGEX = /^http:\/\/(.+)\/sessions\/(.+)$/;

interface Params {
  onScanned: (type: any, data: any) => Promise<string>;
}

export default function QRcodeScanner({onScanned} : Params) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = async ({ type, data }: any) => {
    if (REGEX.test(data)) {
      const res = await onScanned(type, data);        
      if (res == 'Success') {
        setScanned(true);
      }
      setResponse(res);
    } else {
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
        style={styles.camera}
      />
      
      <View>
        <Text style={styles.responseText}>{response}</Text>       
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  camera: {
    minHeight: 400,
  },
  responseText: {
    marginTop: 20,
    fontSize: Platform.select({ios: 18, android: 14}),
    textAlign: 'center',
  },
});