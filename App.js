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

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import exerciseScreen from './src/Exercise';
import {Input} from 'native-base';

var modelJson, modelWeights;
const modelPath = './src/model';

function selectScreen({navigation}) {
  const [count, setCount] = useState(3);
  const onPress = (key) => {
    switch (key) {
      case 'lunge':
        modelJson = require(`${modelPath}/lunge/model.json`);
        modelWeights = require(`${modelPath}/lunge/group1-shard1of1.bin`);
        break;
      case 'squat':
        modelJson = require(`${modelPath}/squat/model.json`);
        modelWeights = require(`${modelPath}/squat/group1-shard1of1.bin`);
        break;
      case 'shoulderPress':
        modelJson = require(`${modelPath}/shoulderPress/model.json`);
        modelWeights = require(`${modelPath}/shoulderPress/group1-shard1of1.bin`);
        break;
      default:
        alert('Select Model!!!');
    }

    navigation.navigate('doing exercise', {
      modelJson,
      modelWeights,
      exercise: key,
      maxInterval: count,
    });
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>어떤 운동을 해볼까나?</Text>

      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          style={{
            marginRight: 10,
            borderWidth: 1,
            borderRadius: 10000,
            padding: 10,
            backgroundColor: count === 3 ? 'gray' : 'white',
          }}
          onPress={() => setCount(3)}>
          <Text>3</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            marginRight: 10,
            borderWidth: 1,
            borderRadius: 10000,
            padding: 10,
            backgroundColor: count === 5 ? 'gray' : 'white',
          }}
          onPress={() => setCount(5)}>
          <Text>5</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            marginRight: 10,
            borderWidth: 1,
            borderRadius: 10000,
            padding: 10,
            backgroundColor: count === 7 ? 'gray' : 'white',
          }}
          onPress={() => setCount(7)}>
          <Text>7</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.btnNavi}
        onPress={(e) => onPress('lunge')}>
        <Text style={{fontWeight: 'bold', color: '#748ffc'}}>런지</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btnNavi}
        onPress={(e) => onPress('squat')}>
        <Text style={{fontWeight: 'bold', color: '#748ffc'}}>스쿼트</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btnNavi}
        onPress={(e) => onPress('shoulderPress')}>
        <Text style={{fontWeight: 'bold', color: '#748ffc'}}>숄더프레스</Text>
      </TouchableOpacity>
    </View>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="select exercise" component={selectScreen} />
        <Stack.Screen
          name="doing exercise"
          component={exerciseScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  btnNavi: {
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 20,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#748ffc',
  },
});
