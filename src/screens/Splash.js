import React from "react";
import {StyleSheet, Text, View, YellowBox} from "react-native";
import * as firebase from "firebase";
import config from "../config/firebase";

export default class Splash extends React.Component {

    constructor(props) {
        super(props);

        if (!firebase.apps.length) {
            firebase.initializeApp(config);
        }
        YellowBox.ignoreWarnings(["Setting a timer for"]);

        this.presenceSystem();
    }

    presenceSystem() {

        let currentUser = firebase.auth().currentUser;
        console.warn(currentUser);


        // Fetch the current user's ID from Firebase Authentication.
        let uid = firebase.auth().currentUser.uid;

        // Create a reference to this user's specific status node.
        // This is where we will store data about being online/offline.
        let userStatusDatabaseRef = firebase.database().ref('/status/' + uid);

        // We'll create two constants which we will write to
        // the Realtime database when this device is offline
        // or online.
        let isOfflineForDatabase = {
            state: 'offline',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
        };

        let isOnlineForDatabase = {
            state: 'online',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
        };

        // Create a reference to the special '.info/connected' path in
        // Realtime Database. This path returns `true` when connected
        // and `false` when disconnected.
        firebase.database().ref('.info/connected').on('value', function (snapshot) {
            // If we're not currently connected, don't do anything.
            console.warn(snapshot);
            if (snapshot.val() == false) {
                return;
            }

            // If we are currently connected, then use the 'onDisconnect()'
            // method to add a set which will only trigger once this
            // client has disconnected by closing the app,
            // losing internet, or any other means.
            userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function () {
                // The promise returned from .onDisconnect().set() will
                // resolve as soon as the server acknowledges the onDisconnect()
                // request, NOT once we've actually disconnected:
                // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

                // We can now safely set ourselves as 'online' knowing that the
                // server will mark us as offline once we lose connection.
                userStatusDatabaseRef.set(isOnlineForDatabase);
            });
        });

    }

    async componentWillMount() {
        await Expo.Font.loadAsync({
            'Roboto': require('native-base/Fonts/Roboto.ttf'),
            'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
        });


        // firebase.auth().onAuthStateChanged((user) => {
        //     let routeName = user === null ? "Login" : "Inbox";
        //     this.props.navigation.navigate(routeName);
        // });

    }

    render() {
        return (
            <View style={styles.container}>
                <Text>Chatty</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    }
});
