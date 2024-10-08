import { Camera, CameraCapturedPicture, CameraView } from 'expo-camera';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform, Image } from 'react-native';

interface Params {
  onTaken: (checkpointId: string, photoUri: string | null) => void;
  checkpointId: string;
};

export default function FaceScanner({checkpointId, onTaken}: Params) {
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const camera = useRef<any>();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const handleTaken = async () => {
    if (cameraReady) {
      const data: CameraCapturedPicture = await camera.current.takePictureAsync({imageType: 'jpg'});
      setPhotoUri(data.uri);
    }
  };

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  
  if (photoUri !== null) {
    return (
      <View style={styles.container}>
        <Image source={{uri: photoUri}} style={styles.camera} />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.redButton} onPress={() => setPhotoUri(null)}>
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => onTaken(checkpointId, photoUri)}>
            <Text style={styles.buttonText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={'front'} onCameraReady={() => setCameraReady(true)} ref={camera} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.redButton} onPress={() => onTaken(checkpointId, null)}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleTaken}>
          <Text style={styles.buttonText}>Take</Text>
        </TouchableOpacity>
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
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 20,
    marginVertical: 20,
  },
  redButton: {
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
    fontSize: Platform.select({ ios: 18, android: 14 }),
    textAlign: 'center',
    color: 'white',
  }
});
