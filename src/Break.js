import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Modal from 'react-native-modal';
import {maximum} from '@tensorflow/tfjs';
const {width, height} = Dimensions.get('window');
const CONTENTS_WIDTH = width * 0.9;
const CONTENTS_HEIGHT = height * 0.4;

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
  const [loading, setLoading] = useState(false);

  const onPress = () => {
    ///every apply
    if (nowInterval < maxInterval) {
      discard();
    } else {
      discard();
      navigation.navigate('select exercise');
    }
  };

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
          <Text>combo : {combo}</Text>
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
