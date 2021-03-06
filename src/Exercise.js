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

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import Break from './Break';

const TensorCamera = cameraWithTensors(Camera);

const {width, height} = Dimensions.get('window');

const resolution = 224;
var isStart = false;
const timeInterval = [2/4, 3/4, 7/4, 8/4, 12/4, 13/4];
var c = [0, 0, 0, 0, 0, 0];
var videoURL = require('./video/prepare.mp4');
var nowCount = 0; // 현재 몇번 했는지
var nowInterval = 0;
var great = 0,
  nice = 0,
  bad = 0;
var nowScore = '';
var combo = 0;
var maxCombo = 0;
var visible = false;
var pause = false;
var maxCount = 10;
var SoundNum = {
  great: 4,
  nice: 1,
  bad: 1,
};
var interval;
const greatThreshold = 67; 
const niceThreshold = 52;

export default function Exercise({route, navigation}) {
  const [tfReady, setTfReady] = useState(false);
  const [model, setModel] = useState(false);
  const [poseModel, setPoseModel] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [displayText2, setDisplayText2] = useState('');
  const [displayText3, setDisplayText3] = useState('');
  const [pose, setPose] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const windowWidth = useWindowDimensions().width;
  const windowHeight = useWindowDimensions().height;

  const modelJson = route.params.modelJson;
  const modelWeights = route.params.modelWeights;
  const exercise = route.params.exercise;
  const maxInterval = route.params.maxInterval;

  // tfjs 모델 로드
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
    setTfReady(true);
  };

  // 카메라 퍼미션
  const cameraCheck = async () => {
    const {status} = await Camera.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  useEffect(() => {
    videoURL = require('./video/prepare.mp4');
    checkTf();
    cameraCheck();
    Sound.setCategory('Playback');
    var backgroundSound = audioStart('forgiveness.mp3', 1);
    LogBox.ignoreLogs(['Possible Unhandled Promise Rejection']);

    return () => {
      console.log('나 뒤로간다 ㅋ');
      isStart = false;
      clearInterval(interval);
      backgroundSound.stop();
      nowCount = 0;
      nowInterval = 0;
      (great = 0), (nice = 0), (bad = 0);
      nowScore = '';
      combo = 0;
      maxCombo = 0;
      visible = false;
    };
  }, []);

  function audioStart(fileName, volume) {
    var whoosh = new Sound(fileName, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }

      whoosh.setVolume(volume);

      whoosh.play((success) => {
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
    });

    return whoosh;
  }

  // 판정 후 음성
  async function scoreAudio(nowScore, SoundNum) {
    if (nowScore !== 'bad') {
      combo += 1;
    } else {
      maxCombo = Math.max(maxCombo, combo);
      combo = 0;
      audioStart('comboFail.mp3', 0.5);
    }

    audioStart(nowScore + Math.ceil(Math.random() * SoundNum) + '.wav', 1);
  }

  function getFinalScore(){
    var score = ((c[0]+ c[1]) / 8 + (c[2] + c[3]) / 4 + (c[4] + c[5]) / 8) * 100;
    console.log('총점은 : ', score);
    if (score >= greatThreshold) {
      nowScore = 'great';
      console.log('결과는 : great')
      great += 1;
    } else if (score >= niceThreshold) {
      nowScore = 'nice';
      console.log('결과는 : nice')
      nice += 1;
    } else {
      nowScore = 'bad';
      console.log('결과는 : bad')
      bad += 1;
    }

    nowCount += 1;

    scoreAudio(nowScore, SoundNum[nowScore]);

    setDisplayText2(nowCount + ' / ' + maxCount + '\n' + nowScore);
  }

  async function judgement(images, idx) {
    const imageTensor = images.next().value;
    const pose = await poseModel.estimateSinglePose(imageTensor);
    setPose(pose);
    
    var ten = utils.vecotrize(pose);

    const prediction = await model.predict(tf.tensor(ten).reshape([1, 34]));
    
    var label = (idx ===  2 || idx === 3 ) ? 1 : 0
    c[idx] = prediction.dataSync()[label];
    console.log(`${idx} : `, prediction.dataSync());

    if ((nowCount === maxCount - 1) && (idx == 0)) audioStart('last.wav', 1);

    if (idx == 5) getFinalScore();
  }

  function algorithm(images, sec) {
    for (var i = 0; i < 6; i++){
      setTimeout(judgement, sec * timeInterval[i], images, i);
    }
  }

  async function exerciseVideo(exercise, nowInterval) {
    if (exercise === 'squat') {
      videoURL = require('./video/squat.mp4');
    } else if (exercise === 'shoulderPress') {
      videoURL = require('./video/shoulderPress.mp4');
    } else if (exercise === 'lunge') {
      if (nowInterval % 2 === 0) {
        videoURL = require('./video/lungeR.mp4');
      } else {
        videoURL = require('./video/lungeL.mp4');
      }
    }
  }

  async function startExercise(images, time, exercise) {
    if (time > 1000) {
      audioStart('prepare.wav', 1);
      setTimeout(() => {
        audioStart('prepare' + Math.ceil(Math.random() * 3) + '.wav', 1);
      }, time - 4000);
    }

    setTimeout(() => {
      audioStart('count3.wav', 1);

      setTimeout(() => {
        audioStart('count2.wav', 1);
      }, 1000);

      setTimeout(() => {
        audioStart('count1.wav', 1);
      }, 2000);

      setTimeout(() => {
        audioStart('start.wav', 1);
        exerciseVideo(exercise, nowInterval);
        pause = true;
        setTimeout(() => {
          pause = false;
        }, 850);
        setDisplayText2(nowCount + ' / 10');
        //videoURL = exerciseVideo(exercise, nowInterval);
        const sec = 850;
        setTimeout(() => {
          algorithm(images, sec);
          interval = setInterval(() => {
            //운동 판별
            algorithm(images, sec);
            // 코드 좀 잘못짜서 setInterval 멈추는 코드
            if (nowCount == maxCount - 1) {
              clearInterval(interval);
            }
          }, sec * 4);
        }, 700);
      }, 3000);
    }, time);
  }

  let AUTORENDER = true;
  async function handleCameraStream(images, updatePreview, gl) {
    const loop = async () => {
      if (!AUTORENDER) {
        updatePreview();
      }

      const imageTensor = images.next().value;
      const pose = await poseModel.estimateSinglePose(imageTensor);
      setPose(pose);
      if (pose.score >= 0.4) {
        setDisplayText('');
        if (!isStart && !visible && nowInterval < maxInterval) {
          isStart = true;
          if (nowInterval == 0) {
            startExercise(images, 7000, exercise);
          } else {
            startExercise(images, 0, exercise);
          }
        }
      } else {
        setDisplayText('카메라에 딱 맞게 들어와 주세요!');
      }

      tf.dispose([imageTensor]);

      if (!AUTORENDER) {
        gl.endFrameEXP();
      }
      // 1세트 끝날때 일어나는 일.
      if (nowCount == maxCount) {
        nowCount = 0;

        nowInterval += 1;

        videoURL = require('./video/prepare.mp4');
        if (nowInterval === maxInterval) {
          combo = Math.max(maxCombo, combo);
        }
        visible = true;
        isStart = false;
        console.log('visible : ', visible);
        setDisplayText('');
        setDisplayText2('');
        setDisplayText3('');
      }
      requestAnimationFrame(loop);
    };

    loop();
  }

  const discard = () => {
    console.log(visible);
    visible = false;
    console.log(visible);
  };

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
      <Text
        style={{
          position: 'absolute',
          left: 10,
          top: height * 0.1,
          fontSize: 20,
          zIndex: 2,
          backgroundColor: 'white',
        }}>
        {displayText}
      </Text>
      <Text
        style={{
          position: 'absolute',
          right: 10,
          top: height * 0.1,
          fontSize: 20,
          zIndex: 2,
          backgroundColor: 'white',
        }}>
        {displayText2}
      </Text>
      <Text
        style={{
          position: 'absolute',
          left: 10,
          top: height * 0.1,
          fontSize: 20,
          zIndex: 2,
          backgroundColor: 'white',
        }}>
        {displayText3}
      </Text>
      <Video
        source={videoURL}
        style={{flex: 1, width: width, height: height}}
        repeat={true}
        muted
        paused={pause}
      />
      <View
        style={{
          width: width * 0.3,
          height: height * 0.23,
          position: 'absolute',
          bottom: height * 0.18,
          left: '3%',
        }}>
        <View style={styles.container}>
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
      <Break
        visible={visible}
        combo={combo}
        great={great}
        nice={nice}
        bad={bad}
        nowInterval={nowInterval}
        maxInterval={maxInterval}
        discard={discard}
        navigation={navigation}
      />
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
