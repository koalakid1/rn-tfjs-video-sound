import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Modal from 'react-native-modal';
import * as Progress from 'react-native-progress';
import {Surface, Shape} from '@react-native-community/art';

const {width, height} = Dimensions.get('window');

var time = 0;
var progress = 0;
var progressStop = false;

const Break = ({
  visible,
  nowInterval,
  maxInterval,
  great,
  nice,
  bad,
  combo,
  discard,
  navigation,
}) => {
  const onPress = () => {
    ///every apply
    if (nowInterval < maxInterval) {
      discard();
    } else {
      discard();
      navigation.navigate('select exercise');
    }
    progress = 0;
    time = 0;
  };

  function animate() {
    if (nowInterval < maxInterval) {
      var timeInterval = setInterval(() => {
        time += 1;
        if (time == 30) {
          clearInterval(timeInterval);
        }
      }, 1000);
      var progressInterval = setInterval(() => {
        progress += 0.5;
        if (progress == 30) {
          if (nowInterval < maxInterval) {
            discard();
          } else {
            discard();
            navigation.navigate('select exercise');
          }
          clearInterval(progressInterval);

          setTimeout(() => {
            time = 0;
            progress = 0;
            progressStop = false;
          }, 1000);
        }
      }, 500);
    }
  }

  if (visible == true && progressStop == false) {
    progressStop = true;
    animate();
  }

  return (
    <Modal isVisible={visible} style={styles.container}>
      <View style={styles.contents}>
        <View style={{alignSelf: 'center'}}>
          <Text>
            {nowInterval} / {maxInterval}
          </Text>
          <Text>
            great : {great} nice : {nice} bad : {bad}
          </Text>
          {nowInterval !== maxInterval ? (
            <>
              <Text>combo : {combo}</Text>
              <Text style={{textAlign: 'center'}}>{30 - time}</Text>
              <Progress.Bar progress={progress / 30} />
            </>
          ) : (
            <Text>maxCombo : {combo}</Text>
          )}
        </View>
        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={[styles.btn, {marginRight: 20}]}
            onPress={onPress}>
            <Text style={styles.txtBtn('#4c6ef5')}>
              {nowInterval < maxInterval ? '다음 세트' : '나가기'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contents: {
    backgroundColor: '#fff',
    width: width,
    height: height,
    paddingTop: 20,
    borderRadius: 10,
    justifyContent: 'space-between',
  },

  title: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 20,
    width: 180,
    paddingVertical: 10,
    backgroundColor: '#845ef7',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  txtAletTitle: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 22,
  },
  txtTags: {
    marginLeft: 10,
    marginTop: 3,
    fontWeight: 'bold',
    color: '#868e96',
  },
  guide: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  txtContentTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#845ef7',
    marginBottom: 10,
  },

  confirm: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  confirmStep: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtStep: {
    marginTop: 3,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#343a40',
  },
  icon: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#845ef7',
  },

  btnGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 30,
    borderRadius: 10,
  },

  txtBtn: (color) => ({
    color: color,
    fontWeight: 'bold',
    fontSize: 14,
  }),

  indicator: {
    position: 'absolute',
    bottom: height * 0.2,
  },
});

export default Break;
