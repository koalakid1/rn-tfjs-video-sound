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

const TensorCamera = cameraWithTensors(Camera);
const modelJson = require('./model/model.json');
const modelWeights = require('./model/group1-shard1of1.bin');
const {width, height} = Dimensions.get('window');

const resolution = 224;
var isStart = false;

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

  // useEffect(() => {
  //     checkTf();
  //     cameraCheck();
  // }, [])

  useEffect(() => {
    // (async () => {
    //     const {status} = await Camera.requestPermissionsAsync();
    //     setHasPermission(status === 'granted');
    // })();
    checkTf();
    cameraCheck();

    // Enable playback in silence mode
    Sound.setCategory('Playback');

    //audioStart('forgiveness1.mp3',0.05);
  }, []);

  function audioStart(fileName, volume) {
    // Load the sound file 'whoosh.mp3' from the app bundle
    // See notes below about preloading sounds within initialization code below.
    var whoosh = new Sound(fileName, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
      // loaded successfully
      console.log(
        'duration in seconds: ' +
          whoosh.getDuration() +
          'number of channels: ' +
          whoosh.getNumberOfChannels(),
      );

      // Play the sound with an onEnd callback
      whoosh.play((success) => {
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
    });

    // Reduce the volume by half
    whoosh.setVolume(volume);

    // Position the sound to the full right in a stereo field
    whoosh.setPan(1);

    // Loop indefinitely until stop() is called
    whoosh.setNumberOfLoops(-1);

    // Get properties of the player instance
    console.log('volume: ' + whoosh.getVolume());
    console.log('pan: ' + whoosh.getPan());
    console.log('loops: ' + whoosh.getNumberOfLoops());

    // Seek to a specific point in seconds
    whoosh.setCurrentTime(2.5);

    // Get the current playback point in seconds
    whoosh.getCurrentTime((seconds) => console.log('at ' + seconds));

    // Pause the sound
    whoosh.pause();

    // Release the audio player resource
    whoosh.release();
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
      console.log(pose.score);
      console.log(isStart);
      if (pose.score >= 0.4) {
        isStart = true;
        setDisplayText('start');
        // var ten = utils.vecotrize(pose);
        // // Data 만들
        // const prediction = await model.predict(tf.tensor(ten).reshape([1, 34]));
        // const posenum = prediction.argMax(1).dataSync()[0];
        // const highestPropPred = prediction.dataSync()[posenum];
        // const surity = Math.round(highestPropPred * 100);
        // Debugging
        // console.log('pose number : ', posenum);
        // console.log('pose prob : ', surity);
        // console.log('all prob : ', prediction.dataSync());
        // if (surity > 30) {
        //   if (posenum === 0) {
        //     setDisplayText('스탠드');
        //   } else if (posenum === 1) {
        //     setDisplayText('스~~~쿼트!!!!');
        //   } else if (posenum === 2) {
        //     setDisplayText('자세가 잘못되었습니다.');
        //   } else {
        //     setDisplayText('Wrong Result');
        //   }
        // } else {
        //   setDisplayText('not sure what that is');
        // }
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

    setTimeout(() => {
      var c1;
      var c2;
      var c3;

      audioStart('start1.mp3', 1);
      setTimeout(async () => {
        const imageTensor = images.next().value;
        const pose = await poseModel.estimateSinglePose(imageTensor);
        setPose(pose);
        console.log(pose);
        var ten = utils.vecotrize(pose);

        // Data 만들

        const prediction = await model.predict(tf.tensor(ten).reshape([1, 34]));
        const posenum = prediction.argMax(1).dataSync()[0];

        if (posenum == 0) {
          c1 = 100;
        } else {
          c1 = 0;
        }
        console.log(c1);
      }, 1000);

      setTimeout(async () => {
        const imageTensor = images.next().value;
        const pose = await poseModel.estimateSinglePose(imageTensor);
        setPose(pose);
        console.log(pose);
        var ten = utils.vecotrize(pose);

        // Data 만들

        const prediction = await model.predict(tf.tensor(ten).reshape([1, 34]));
        const posenum = prediction.argMax(1).dataSync()[0];
        if (posenum == 1) {
          c2 = 100;
        } else {
          c2 = 0;
        }
        console.log(c2);
      }, 1800);

      setTimeout(async () => {
        const imageTensor = images.next().value;
        const pose = await poseModel.estimateSinglePose(imageTensor);
        setPose(pose);
        console.log(pose);
        var ten = utils.vecotrize(pose);

        // Data 만들

        const prediction = await model.predict(tf.tensor(ten).reshape([1, 34]));
        const posenum = prediction.argMax(1).dataSync()[0];
        if (posenum == 0) {
          c3 = 100;
        } else {
          c3 = 0;
        }
        console.log(c3);

        var score = c1 + c2 + c3;
        if (score == 300) {
          audioStart('great.mp3', 1);
        } else if (c2 == 100) {
          audioStart('nice.mp3', 1);
        } else {
          audioStart('bad.mp3', 1);
        }
      }, 3000);
      setInterval(() => {
        audioStart('start1.mp3', 1);
        setTimeout(async () => {
          const imageTensor = images.next().value;
          const pose = await poseModel.estimateSinglePose(imageTensor);
          setPose(pose);
          console.log(pose);
          var ten = utils.vecotrize(pose);

          // Data 만들

          const prediction = await model.predict(
            tf.tensor(ten).reshape([1, 34]),
          );
          const posenum = prediction.argMax(1).dataSync()[0];

          if (posenum == 0) {
            c1 = 100;
          } else {
            c1 = 0;
          }
          console.log(c1);
        }, 1000);

        setTimeout(async () => {
          const imageTensor = images.next().value;
          const pose = await poseModel.estimateSinglePose(imageTensor);
          setPose(pose);
          console.log(pose);
          var ten = utils.vecotrize(pose);

          // Data 만들

          const prediction = await model.predict(
            tf.tensor(ten).reshape([1, 34]),
          );
          const posenum = prediction.argMax(1).dataSync()[0];
          if (posenum == 1) {
            c2 = 100;
          } else {
            c2 = 0;
          }
          console.log(c2);
        }, 1800);

        setTimeout(async () => {
          const imageTensor = images.next().value;
          const pose = await poseModel.estimateSinglePose(imageTensor);
          setPose(pose);
          console.log(pose);
          var ten = utils.vecotrize(pose);

          // Data 만들

          const prediction = await model.predict(
            tf.tensor(ten).reshape([1, 34]),
          );
          const posenum = prediction.argMax(1).dataSync()[0];
          if (posenum == 0) {
            c3 = 100;
          } else {
            c3 = 0;
          }
          console.log(c3);

          var score = c1 + c2 + c3;
          if (score == 300) {
            audioStart('great.mp3', 1);
          } else if (c2 == 100) {
            audioStart('nice.mp3', 1);
          } else {
            audioStart('bad.mp3', 1);
          }
        }, 3000);
      }, 4000);
    }, 3000);
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
        source={require('./squat.mp4')}
        style={{flex: 1, width: width, height: height}}
        repeat={true}
        muted
      />
      <View
        style={{
          width: width * 0.3,
          height: height * 0.23,
          position: 'absolute',
          bottom: height * 0.5,
          left: '3%',
        }}>
        <View style={styles.container}>
          <Text style={{fontWeight: 'bold', width: width * 0.6}}>
            {displayText}
          </Text>
          {/* <Text style={{fontWeight: 'bold', alignSelf: 'flex-end'}}>
            {count}
          </Text>
          <Text style={{fontWeight: 'bold', alignSelf: 'flex-end'}}>
            Nice: {nice}, Great: {great}, Bad: {bad}
          </Text> */}
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
