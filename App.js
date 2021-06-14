import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import styled from "styled-components/native";
import { MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system';
import * as Permissions from "expo-permissions";
import * as MediaLibrary from 'expo-media-library'

const { width, height } = Dimensions.get("window");

const ALBUM_NAME = "Smiley Cam";

const CenterView = styled.View`
 flex: 1;
 justify-content: center;
 align-items: center;
 background-color: cornflowerblue;
`;

const Text = styled.Text`
  color: white;
  font-size: 22px;
`;

const IconBar = styled.View`
  margin-top: 50px;
`;

export default function App() {
  
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [smileDetected, setSmileDetected] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <CenterView />;
  }
  if (hasPermission === false) {
    return <CenterView><Text>No access to camera</Text></CenterView>;
  }

  const switchCameraType = () => {
    if (cameraType === Camera.Constants.Type.front) {
      setCameraType(Camera.Constants.Type.back);
    } else {
      setCameraType(Camera.Constants.Type.front);
    }
  }

  const onFacesDetected = ({faces}) => {
    const face = faces[0];
    if (face) {
      if(face.smilingProbability > 0.07){
        setSmileDetected(true);
        takePhoto();
      }
    }
  }
  
  const takePhoto = async() => {
    try {
      if(cameraRef.current) {
        let {uri} = await cameraRef.current.takePictureAsync({ 
          quality: 1
        });
        if(uri){
          savePhoto(uri);
        }
      }
    } catch(error) {
      alert(error);
      setSmileDetected(false);
    }
  }

  const savePhoto = async uri => {
    try{
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if(status === 'granted'){
        const asset = await MediaLibrary.createAssetAsync(uri);
        const album = await MediaLibrary.getAlbumAsync('Smiley Cam');
        if(album === null) {
          letalbum = await MediaLibrary.createAlbumAsync(
            ALBUM_NAME, 
            asset
            );
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album.id);
        }
        setTimeout(() => setSmileDetected(false), 2000);
      } else {
        setHasPermission(false);
      }
    } catch {
      console.log("error")
    }
  };

  return (
    <CenterView>
      <Camera style={{ 
        width: width - 40, 
        height: height / 1.5, 
        borderRaidus: 10, 
        overflow: "hidden" 
        }}
        type={cameraType}
        onFacesDetected={smileDetected ? null : onFacesDetected}
        faceDetectorSettings={{
          detectLandmarks: FaceDetector.Constants.Landmarks.all,
          runClassifications: FaceDetector.Constants.Classifications.all
        }}
        ref={cameraRef}
        />
        <IconBar>
          <TouchableOpacity onPress={switchCameraType}>
            <MaterialIcons 
            name={ cameraType === Camera.Constants.Type.back ? "camera-front" : "camera-rear" } 
            size={50} 
            color="white" 
            />
          </TouchableOpacity>
        </IconBar>
    </CenterView>
  );
}
