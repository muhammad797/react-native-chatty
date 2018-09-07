import {createStackNavigator} from "react-navigation";
import Splash from "./screens/Splash";
import Login from "./screens/Login";
import Register from "./screens/Register";
import Inbox from "./screens/Inbox";
import Chat from "./screens/Chat";

const Chatty = createStackNavigator(
    {
        Splash: {
            screen: Splash
        },
        Login: {
            screen: Login
        },
        Register: {
            screen: Register
        },
        Inbox: {
            screen: Inbox
        },
        Chat: {
            screen: Chat
        }
    },
    {
        headerMode: "none"
    }
);

export default Chatty;
