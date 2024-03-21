import React, {Component, useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Dimensions,
  Switch,
  TouchableOpacity,
  Image,
} from 'react-native';
import {WebView} from 'react-native-webview';
import SendIntentAndroid from 'react-native-send-intent';

const windowWidth = Dimensions.get('screen').width;
const windowHeight = Dimensions.get('screen').height;

export default function App(props) {
  const onPress = () => {
    props.callback(0);
  };

  const openGoogleMap = () => {
   
    var geo = props.lat + ',' + props.lon;
                  SendIntentAndroid.openMapsWithRoute(geo, "d")
  };


  TouchableOpacity.defaultProps = {activeOpacity: 0.8};

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
     
    

      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
       
      <TouchableOpacity style={styles.loginBtnbus}           onPress={openGoogleMap} >

       
        <Text
          style={{
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 'bold',
            marginTop: 20,
            color: 'red',
          }}

          >
         BLIND SOS IS DETECTED
        </Text>

        <Text style={{fontSize:15,fontWeight:'bold'}}>Click here for track blind person</Text>

        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.loginBtn2} onPress={onPress}>
          <Text style={styles.loginText}>BACK TO NORMAL</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  appButtonContainer: {
    elevation: 8,
    backgroundColor: '#05b311',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  appButtonText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
  loginBtn: {
    width: '80%',
    backgroundColor: 'red',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    margin: 10,
  },

  loginBtn5: {
    backgroundColor: 'red',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    margin: 10,
  },
  loginBtn2: {
    width: '80%',
    backgroundColor: 'green',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    margin: 10,
  },

  loginBtnbus: {
    width: '80%',
    backgroundColor: 'lightgrey',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    margin: 10,
  },
  loginText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
