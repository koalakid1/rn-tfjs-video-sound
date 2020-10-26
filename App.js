import { Camera } from 'expo-camera';
import React, {useEffect, useState} from 'react';
import * as tf from '@tensorflow/tfjs'
import { cameraWithTensors, bundleResourceIO , decodeJpeg } from '@tensorflow/tfjs-react-native';
import { Platform, StyleSheet, Dimensions, View , Text, useWindowDimensions } from 'react-native';
import * as posenet from '@tensorflow-models/posenet';

import { setdiff1dAsync } from '@tensorflow/tfjs';
import Svg, { Circle, Rect, G, Line} from 'react-native-svg';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Container, Content, ListItem, List, Button} from 'native-base';
import Video, { FilterType } from 'react-native-video';
import Sound from 'react-native-sound';

const TensorCamera = cameraWithTensors(Camera);
const modelJson = require('./model/model.json')
const modelWeights = require('./model/group1-shard1of1.bin')
const {width, height} = Dimensions.get('window')
// console.log(modelJson);

export default function App(props){
  const [tfReady, setTfReady] = useState(false)
  const [model, setModel] = useState(false)
  const [poseModel, setPoseModel] = useState(false)
  const [start, setStart] = useState(false)
  const [displayText, setDisplayText] = useState("loading models")
  const [pose, setPose] = useState(null)
  const windowWidth = useWindowDimensions().width;
  const windowHeight = useWindowDimensions().height;

  useEffect(()=>{
    let checkTf= async()=>{
      console.log("loading models")
      await tf.ready()
      console.log("tf ready loading, mobileNet")
      const poseModel = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 224, height: 224 },
        multiplier: 0.75,
        quantBytes: 2
      });
      console.log("Posenet loaded")
      const model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
      // const model = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
      console.log("Classifier loaded")
      setPoseModel(poseModel)
      setModel(model)
      setDisplayText("loaded Models")
      setTfReady(true)
    }
    checkTf()
  },[])
  
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    var whhosh = new Sound('Forgiveness.mp3', Sound.MAIN_BUNDLE)
    whhosh.play()
    
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  function renderPose(){
    const MIN_KEYPOINT_SCORE = 0.2;
    
    if (pose != null){
      const keypoints = pose.keypoints
      .filter(k => k.score > MIN_KEYPOINT_SCORE)
      .map((k, i) => {
        return <Circle
          key={i+''}
          cx={k.position.x}
          cy={k.position.y}
          r='10'
          strokeWidth='0'
          fill='blue'
        />
      });

      return <Svg height='100%' width='100%'
        viewBox={'0 0 224 224'}>
          {keypoints}
        </Svg>;
    }
  }


  let AUTORENDER = true
  async function handleCameraStream( images,updatePreview, gl) {
    const loop = async () => {
      if(!AUTORENDER) {
        updatePreview();
      }
      
      const imageTensor = images.next().value;
      
      // PoseNet
      const pose = await poseModel.estimateSinglePose(imageTensor);
      setPose(pose)

      if (pose.score >= 0.4){
        
        var ten = pose.keypoints
          .map((item, key) => {
            return [item.position.x, item.position.y];
          })
          .flat();
        
        // console.log("original : ", ten)
        
        var xlist = pose.keypoints
          .map((item) => {
            return [item.position.x];
          })
          .flat();

        var ylist = pose.keypoints
          .map((item) => {
            return [item.position.y];
          })
          .flat();

        const x_max = Math.max.apply(null, xlist);
        const y_max = Math.max.apply(null, ylist);
        const x_min = Math.min.apply(null, xlist);
        const y_min = Math.min.apply(null, ylist);
        const w = x_max - x_min;
        const h = y_max - y_min;

        for (var i = 0; i < 34; i++) {
          if (i % 2 === 0) {
            ten[i] = (ten[i] - x_min) / w;
          } else {
            ten[i] = (ten[i] - y_min) / h;
          }
        }

        const leftHip_x = ten[24];
        const leftHip_y = ten[25];
        const rightHip_x = ten[26];
        const rightHip_y = ten[27];
        var mHip_x, mHip_y, l;

        if (leftHip_x > 0 && leftHip_y > 0 && rightHip_x > 0 && rightHip_y > 0){
          mHip_x = (leftHip_x + rightHip_x) / 2
          mHip_y = (leftHip_y + rightHip_y) / 2
        } else if (leftHip_x <= 0 || leftHip_y <= 0){
          mHip_x = rightHip_x
          mHip_y = rightHip_y
        } else {
          mHip_x = leftHip_x
          mHip_y = leftHip_y
        }
        
        for(var i = 0; i < 34; i++){
          if (i % 2 === 0){
            ten[i] = mHip_x - ten[i]
          } else {
            ten[i] = mHip_y - ten[i]
            l = (ten[i - 1]**2 + ten[i]**2)**(0.5)
            ten[i-1] /= l
            ten[i] /= l
          }
        }

        // console.log('veclog',ten,'veclog')
        // PoseNet 결과 인풋
        const prediction = await model.predict(tf.tensor(ten).reshape([1, 34]));
        const posenum = prediction.argMax(1).dataSync()[0];
        const highestPropPred = prediction.dataSync()[posenum];
        const surity = Math.round(highestPropPred*100)

        // console.log('pose number : ', posenum);
        // console.log('pose prob : ', surity);
        // console.log('all prob : ', prediction.dataSync());

        if(surity > 30){
          if(posenum === 0){
            setDisplayText('스탠드')
          }
          else if(posenum === 1){
            setDisplayText('스~~~쿼트!!!!')
          }
          else if(posenum === 2){
            setDisplayText('자세가 잘못되었습니다.')
          }
          else{
            setDisplayText('Wrong Result')
          }
        }else{
          setDisplayText("not sure what that is" )
        }
      } else {
        setDisplayText('카메라에 딱 맞게 들어와 주세요!')
      }

      

      tf.dispose([imageTensor]);

      if(!AUTORENDER) {
        gl.endFrameEXP();
      }
      requestAnimationFrame(loop);
    };

    loop();
  }
  
    // Currently expo does not support automatically determining the
    // resolution of the camera texture used. So it must be determined
    // empirically for the supported devices and preview size.

    let textureDims;
    if (Platform.OS === 'ios') {
      textureDims = {
        height: 1920,
        width: 1080,
      };
    } else {
      textureDims = {
        height: 1200,
        width: 1600,
      };
    }
    const uri = require('./squat.mp4');
    return (
    <Container>
        <Video 
            //source={{uri: 'https://www.w3schools.com/html/mov_bbb.mp4'}}   // Can be a URL or a local file.
            source={uri}
            style={{flex:1, width : width, height:height}}
            repeat={true}
            muted
        />
        <View style ={{
            borderWidth:1,
            width : width*0.2,
            height: height * 0.2,
            position :'absolute',
            bottom : height*0.12,
            right : 10,
            backgroundColor: "tomato"
        }} >
        <View style={styles.container}>
            <Text style={{fontWeight:'bold', width:width*0.6}}>{displayText}</Text>

    {tfReady  ? (<TensorCamera
        // Standard Camera props
        style={{
        zIndex: -10,
        width: width*0.6,
        height: height*0.4,
        }}
        type={Camera.Constants.Type.front}
        // Tensor related props
        cameraTextureHeight={textureDims.height}
        cameraTextureWidth={textureDims.width}
        resizeHeight={224}
        resizeWidth={224}
        resizeDepth={3}
        onReady={handleCameraStream}
        autorender={AUTORENDER}
    />) : <View/>}
    </View>
    </View>
    </Container>
    
    );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#eaeaea", 
    flexDirection:'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelResults: {
    position:'absolute',
    left: 0,
    top:92,
    width: width*1,
    height: height*0.8,
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 0,
  }
})





// const {width,height} = Dimensions.get('window');




// function VideosListScreen({navigation}){
//     return (
//     <Container>
//         <Content>
//             <List>
//                 <ListItem onPress={() => navigation.navigate('Video Player',{
//                     external:true,
//                     videoURL:'https://www.w3schools.com/html/mov_bbb.mp4'
//                 })}>
//                     <Text>External Video Source</Text>
//                 </ListItem>
//                 <ListItem onPress={() => navigation.navigate('Video Player',{
//                     external:false,
//                     videoURL: ''
//                 })}>
//                     <Text>Local/Internal Video Source</Text>
//                 </ListItem>
//             </List>
//         </Content>


        


//     </Container>
//     );
// }

// function VideoPlayerScreen({navigation, route}){
//     const {external, videoURL} = route.params;
//     const [filterType, setFilterType] = React.useState(FilterType.NONE);

//     changeFilter=filterType=>{
//         setFilterType(filterType)
//     }
//     return (
//     <Container>
//         <Video 
//             source={external ? {uri: videoURL} : videoURL}   // Can be a URL or a local file.
//             style={{flex:1, width : width, height:height}}
//         />
//                 <View style ={{
            // borderWidth:1,
            // width :150,
            // height: 200,
            // position :'absolute',
            // bottom : 30,
            // right : 10,
            // backgroundColor: "tomato"
//         }} />
//     </Container>);
// }

// const Stack = createStackNavigator();

// export default function App() {
//     return (
//         <NavigationContainer>
//             <Stack.Navigator>
//                 <Stack.Screen name="Video List" component={VideosListScreen}/>
//                 <Stack.Screen name="Video Player" component={VideoPlayerScreen}/>
//             </Stack.Navigator>
//         </NavigationContainer>
//     )
// }