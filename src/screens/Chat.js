import React from "react";
import firebase from "firebase";
import {GiftedChat} from 'react-native-gifted-chat'
import {Body, Button, Header, Icon, Left, Right, Title} from "native-base";
import {SafeAreaView} from "react-native";

export default class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.me = firebase.auth().currentUser;

        this.state = {
            messages: []
        };

        this.conversation_id = props.navigation.state.params.conversation_id;
        this.key = props.navigation.state.params.key;
        this.name = props.navigation.state.params.name;

        this.chatRef = firebase.database().ref(`conversation/${this.conversation_id}/chat`);
    }

    componentWillMount() {
        this.chatRef.on("value", snapshot => {
            let conversation = snapshot.val();
            if (conversation !== null) {
                let messages = [];
                let keys = Object.keys(conversation);
                keys.map(key => {
                    messages.push(conversation[key]);
                });
                messages = messages.reverse();
                this.setState({messages});
            }
        })
    }

    reOrderFriendList(message) {
        this.friendListRef = firebase.database().ref(`users/${this.me.uid}/friend_list`);
        this.friendListItemRef = firebase.database().ref(`users/${this.me.uid}/friend_list/${this.key}`);
        this.friendListItemRef.once("value", snapshot => {
            let item = snapshot.val();
            this.reOrderFriendListOfOtherPerson(item, message);
            this.friendListItemRef.remove(res => {
                item.lastMessage = message;
                let newFriendListItem = this.friendListRef.push(item);
                this.key = newFriendListItem.key;
            })
        });
    }

    reOrderFriendListOfOtherPerson(meItem, message) {
        let otherPersonFriendListRef = firebase.database().ref(`users/${meItem.user_id}/friend_list`);

        let otherPersonsFriendListWithConversationRef = firebase.database().ref(`users/${meItem.user_id}/friend_list`).orderByChild("conversation_id").equalTo(meItem.conversation_id);
        otherPersonsFriendListWithConversationRef .once("value", snapshot => {
            let key = Object.keys(snapshot.val())[0];

            let otherPersonFriendListItemRef = firebase.database().ref(`users/${meItem.user_id}/friend_list/${key}`)
            otherPersonFriendListItemRef.once('value', snapshot => {

                let item = snapshot.val();
                console.warn(item);
                otherPersonFriendListItemRef.remove(res => {
                    item.lastMessage = message;
                    otherPersonFriendListRef.push(item);
                })

            });
        })
    }

    onSend(messages = []) {
        if (messages.length === 1) {
            let message = messages[0];
            message.created_at = new Date();
            message.user.name = this.me.displayName;
            this.chatRef.push(message);
            this.reOrderFriendList(message);
        }
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1}}>
                <Header>
                    <Left>
                        <Button transparent onPress={() => this.props.navigation.goBack()}>
                            <Icon name='arrow-back'/>
                        </Button>
                    </Left>
                    <Body>
                    <Title>{this.name}</Title>
                    </Body>
                    <Right/>
                </Header>

                <GiftedChat
                    style={{flex: 1}}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: this.me.uid,
                    }}
                />
            </SafeAreaView>
        )

    }

}