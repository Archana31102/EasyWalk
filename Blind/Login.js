import React, { useState, useEffect} from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import NormalHealth from "./NormalHealth";
import AbnormalHealth from "./AbnormalHealth";
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MQTT from 'react-native-mqtt-new';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PushNotification from 'react-native-push-notification';

export default function App(props) {
  const [flag, setflag] = useState(0);
  const [usernameentered, setusernameentered] = useState("");
  const [passwordentered, setpasswordentered] = useState("");
  const [SOS_Topic, setSOS_Topic] = useState("gps_data");
  const { width, height } = Dimensions.get("screen");
  const [lat, setlat] = useState("");
  const [lon, settlon] = useState("");




  function login() {

      if (usernameentered == "") {
        alert("Please enter Username ")
      }
      else if (passwordentered == "") {
        alert("Please enter Password ")
      }


      else if (usernameentered == "1" && passwordentered == "1") {

        setflag(1)



        MQTT.createClient({
          uri: 'mqtt://103.217.220.20:1883',

          clientId: 'your_client_id'
        }).then(function (client) {
          client.on('closed', function () {
            // console.log('mqtt.event.closed');
          });
          client.on('error', function (msg) {

          });

          client.on('message', function (msg) {
            console.log('mqtt.event.message', msg);
            console.log(msg.data)
            console.log("********** substring*********")

            if (msg.data != "0") {

              if (flag == 0 || flag == 1) {


                var mqttvalue = msg.data;
                var splits = mqttvalue.split(',');
                setlat(splits[0]);
                settlon(splits[1]);

                setflag(2)

              }

            }




          })




          client.on('connect', function () {
            console.log('connected');
            client.subscribe(SOS_Topic, 0);


          });

          client.connect();
        }).catch(function (err) {
          console.log(err);
        });
        // console.log (usernameentered)
        // console.log (passwordentered)

      }

      else {

        alert("Entered Username and Password is incorrect")
      }


   


  }

  const callback = (value) => {

    console.log("++++++++++++++++++++++++++" + value)

    // setfarmstatus(0)

    setflag(1)



  }


  if (flag == 0) {
    return (





      <KeyboardAwareScrollView

        enableAutomaticScroll
        extraScrollHeight={10}
        enableOnAndroid={true}
        extraHeight={Platform.select({ android: 200 })}
        style={{ flexGrow: 1 }}

      >

        <View style={styles.container}>

          <LinearGradient colors={['#3dcc8c','#42f5a4', '#23ad6f']} style={{ flex: 1, height: height, justifyContent: 'center', alignItems: 'center' }}>

            <Text style={styles.logo}>BLIND APP</Text>
            <View style={styles.inputView} >
              <TextInput
                style={styles.inputText}
                placeholder="Username"
                placeholderTextColor="grey"
                onChangeText={text => setusernameentered(text)} />
            </View>
            <View style={styles.inputView} >
              <TextInput
                secureTextEntry
                style={styles.inputText}
                placeholder="Password"
                placeholderTextColor="grey"
                onChangeText={text => setpasswordentered(text)} />
            </View>

          


            <TouchableOpacity style={styles.loginBtn}
              onPress={login}
            >
              <Text style={styles.loginText}>LOGIN</Text>
            </TouchableOpacity>

          </LinearGradient>
        </View>

      </KeyboardAwareScrollView>


    );

  }



  else if (flag == 1) {

    return (

      <NormalHealth
      />
    )
  }

  else if (flag == 2) {

    return (

      <AbnormalHealth callback={callback} lat={Number(lat)} lon={Number(lon)}  />
    )
  }


}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  logo: {
    fontWeight: "bold",
    fontSize: 25,
    color: "white",
    marginBottom: 50
  },
  inputView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    height: 50,
    marginBottom: 20,
    justifyContent: "center",
    padding: 20
  },
  inputText: {
    height: 50,
    color: "black",
    fontSize: 18
  },
  forgot: {
    color: "white",
    fontSize: 11
  },
  loginBtn: {
    width: "80%",
    backgroundColor: "#0b99a3",
    borderRadius: 10,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 10
  },
  loginText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 20
  },
  linearGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
