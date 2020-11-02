/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Platform,
  Dimensions,
  useWindowDimensions,
  LogBox,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {Camera} from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import {
  cameraWithTensors,
  bundleResourceIO,
  decodeJpeg,
} from '@tensorflow/tfjs-react-native';
import * as posenet from '@tensorflow-models/posenet';

import Svg, {Circle, Rect, G, Line} from 'react-native-svg';

import Sound from 'react-native-sound';
import Video from 'react-native-video';
import * as utils from './utils/utils';
import CircleProgress from './utils/circleProgress';

import lungeModel from './model/lunge/model.json';
import lungeModelWeights from './model/lunge/group1-shard1of1.bin';
import shoulderPressModel from './model/shoulder_press/model.json';
import shoulderPressModelWeights from './model/shoulder_press/group1-shard1of1.bin';
import squatModel from './model/squat/model.json';
import squatModelWeights from './model/squat/group1-shard1of1.bin';

const TensorCamera = cameraWithTensors(Camera);
// const modelJson = lungeModel;
// const modelWeights = lungeModelWeights;
// const modelJson = shoulderPressModel;
// const modelWeights = shoulderPressModelWeights;
const modelJson = squatModel;
const modelWeights = squatModelWeights;
const {width, height} = Dimensions.get('window');

const resolution = 224;
var isStart = false;
var c1, c2, c3, c4, c5, c6;
var videoURL = require('./prepare.mp4');
var checkExCount = 0;
var checkIntervalCount = 0;

export default function App() {
  const [tfReady, setTfReady] = useState(false);
  const [model, setModel] = useState(false);
  const [poseModel, setPoseModel] = useState(false);
  const [displayText, setDisplayText] = useState('loading models');
  const [pose, setPose] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const windowWidth = useWindowDimensions().width;
  const windowHeight = useWindowDimensions().height;

  const checkTf = async () => {
    console.log('loading models');
    await tf.ready();
    console.log('tf ready loading, mobileNet');
    const poseModel = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: {width: resolution, height: resolution},
      multiplier: 0.75,
      quantBytes: 2,
    });
    console.log('Posenet loaded');
    const model = await tf.loadLayersModel(
      bundleResourceIO(modelJson, modelWeights),
    );
    console.log('Classifier loaded');
    setPoseModel(poseModel);
    setModel(model);
    setDisplayText('loaded Models');
    setTfReady(true);
  };

  const cameraCheck = async () => {
    const {status} = await Camera.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  useEffect(() => {
    checkTf();
    cameraCheck();
    Sound.setCategory('Playback');
    audioStart('forgiveness.mp3');
    LogBox.ignoreLogs(['Possible Unhandled Promise Rejection']);
  }, []);

  function audioStart(fileName, volume) {
    var whoosh = new Sound(fileName, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }

      whoosh.play((success) => {
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
    });

    whoosh.setVolume(volume);

    whoosh.setPan(1);

    whoosh.setNumberOfLoops(-1);

    whoosh.setCurrentTime(2.5);

    whoosh.pause();

    whoosh.release();
  }

  let AUTORENDER = true;

  async function algorithm(images, sec) {
    //audioStart('start1.mp3', 1);

    setTimeout(async () => {
      const imageTensor = images.next().value;
      const pose = await poseModel.estimateSinglePose(imageTensor);
      setPose(pose);

      var ten = utils.vecotrize(pose);

      const prediction = await model.predict(tf.tensor(ten).reshape([1, 34]));

      c1 = prediction.dataSync()[0];
      console.log('첫번째 : ', prediction.dataSync());
    }, sec * (3 / 4));

    setTimeout(async () => {
      const imageTensor = images.next().value;
      const pose = await poseModel.estimateSinglePose(imageTensor);
      setPose(pose);

      var ten = utils.vecotrize(pose);

      const prediction = await model.predict(tf.tensor(ten).reshape([1, 34]));

      c2 = prediction.dataSync()[0];
      console.log('두번째 : ', prediction.dataSync());
    }, sec * (5 / 4));

    setTimeout(async () => {
      const imageTensor = images.next().value;
      const pose = await poseModel.estimateSinglePose(imageTensor);
      setPose(pose);

      var ten = utils.vecotrize(pose);

      const prediction = await model.predict(tf.tensor(ten).reshape([1, 34]));

      c3 = prediction.dataSync()[1];
      console.log('세번째 : ', prediction.dataSync());
    }, sec * (7 / 4));

    setTimeout(async () => {
      const imageTensor = images.next().value;
      const pose = await poseModel.estimateSinglePose(imageTensor);
      setPose(pose);

      var ten = utils.vecotrize(pose);

      const prediction = await model.predict(tf.tensor(ten).reshape([1, 34]));

      c4 = prediction.dataSync()[1];
      console.log('네번째 : ', prediction.dataSync());
    }, sec * (9 / 4));

    setTimeout(async () => {
      const imageTensor = images.next().value;
      const pose = await poseModel.estimateSinglePose(imageTensor);
      setPose(pose);

      var ten = utils.vecotrize(pose);

      const prediction = await model.predict(tf.tensor(ten).reshape([1, 34]));

      c5 = prediction.dataSync()[0];
      console.log('다섯번째 : ', prediction.dataSync());
    }, sec * (11 / 4));

    setTimeout(async () => {
      const imageTensor = images.next().value;
      const pose = await poseModel.estimateSinglePose(imageTensor);
      setPose(pose);

      var ten = utils.vecotrize(pose);

      const prediction = await model.predict(tf.tensor(ten).reshape([1, 34]));

      c6 = prediction.dataSync()[0];
      console.log('여섯번째 : ', prediction.dataSync());

      var score = ((c1 + c2) / 8 + (c3 + c4) / 4 + (c5 + c6) / 8) * 100;
      console.log('총점은 : ', score);
      if (score >= 67) {
        audioStart('great.mp3', 1);
      } else if (score >= 52) {
        audioStart('nice.mp3', 1);
      } else {
        audioStart('bad.mp3', 1);
      }
      checkExCount += 1;
    }, sec * (13 / 4));
  }

  async function handleCameraStream(images, updatePreview, gl) {
    const loop = async () => {
      if (!AUTORENDER) {
        updatePreview();
      }

      const imageTensor = images.next().value;
      const pose = await poseModel.estimateSinglePose(imageTensor);
      setPose(pose);
      if (pose.score >= 0.4) {
        if (!isStart) {
          isStart = true;
          setTimeout(() => {
            audioStart('count3.mp3');
            setTimeout(() => {
              audioStart('count2.mp3');
            }, 1000);
            setTimeout(() => {
              audioStart('count1.mp3');
            }, 2000);
            setTimeout(() => {
              audioStart('start.mp3');
              videoURL = require('./squat.mp4');
              var sec = 850;
              setTimeout(() => {
                algorithm(images, sec);
                var interval = setInterval(() => {
                  algorithm(images, sec);
                  console.log('checkExCount : ', checkExCount);
                  if (checkExCount == 9) {
                    clearInterval(interval);
                    checkExCount = -1;
                    checkIntervalCount += 1;
                  }
                }, sec * 4);
              }, 700);
            }, 3000);
          }, 7000);
        }

        setDisplayText(checkExCount + ' / 10');
      } else {
        setDisplayText('카메라에 딱 맞게 들어와 주세요!');
      }

      tf.dispose([imageTensor]);

      if (!AUTORENDER) {
        gl.endFrameEXP();
      }
      requestAnimationFrame(loop);
    };

    loop();
  }
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

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <>
      <Video
        source={videoURL}
        style={{flex: 1, width: width, height: height}}
        repeat={true}
        muted
      />
      <View
        style={{
          width: width * 0.3,
          height: height * 0.23,
          position: 'absolute',
          bottom: height * 0.24,
          left: '3%',
        }}>
        <View style={styles.container}>
          <Text style={{fontWeight: 'bold', width: width * 0.3}}>
            {displayText}
          </Text>
          {tfReady ? (
            <TensorCamera
              style={{
                zIndex: -10,
                width: width * 0.39,
                height: height * 0.39,
              }}
              type={Camera.Constants.Type.front}
              cameraTextureHeight={textureDims.height}
              cameraTextureWidth={textureDims.width}
              resizeHeight={resolution}
              resizeWidth={resolution}
              resizeDepth={3}
              onReady={handleCameraStream}
              autorender={AUTORENDER}
            />
          ) : (
            <View />
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});
