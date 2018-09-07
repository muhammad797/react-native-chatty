import React from "react";
import Chatty from "./src/Chatty";

export default class App extends React.Component {
    async componentWillMount() {
        await Expo.Font.loadAsync({
            'Roboto': require('native-base/Fonts/Roboto.ttf'),
            'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
        });
    }

    render() {
        return <Chatty/>;
    }
}
