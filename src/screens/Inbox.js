import React from "react";
import {
    Container,
    Content,
    Header,
    Left,
    Body,
    Title,
    Right,
    Text,
    Button,
    List,
    ListItem
} from "native-base";
import {FlatList, Image, View} from "react-native";
import * as firebase from "firebase";
import {StackActions, NavigationActions} from "react-navigation";

class Inbox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inbox: []
        };
    }

    componentDidMount() {
        let user = firebase.auth().currentUser;
        this.friendsListRef = firebase.database().ref(`users/${user.uid}/friend_list`);
        this.friendsListRef.on("value", snapshot => {
            let friendsList = snapshot.val();
            if (friendsList !== null) {
                let keys = Object.keys(friendsList);
                let inbox = [];
                keys.map(key => {
                    friendsList[key].key = key;
                    inbox.push(friendsList[key]);
                });
                inbox.reverse();
                this.setState({inbox});
            }
        })
    }

    logout = () => {
        firebase
            .auth()
            .signOut()
            .then(res => {
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({routeName: "Login"})]
                });
                this.props.navigation.dispatch(resetAction);
            })
            .catch(error => {
                console.warn(error);
                alert("Can't logout. Please contact administration");
            });
    };

    onPressItem = item => {
        this.props.navigation.navigate("Chat", {
            conversation_id: item.conversation_id,
            key: item.key,
            name: item.name
        });
    };

    renderListItem = ({item}) => {
        return (
            <ListItem onPress={() => this.onPressItem(item)}>
                <Image source={{uri: "https://www.w3schools.com/w3images/avatar2.png"}}
                       style={{width: 40, height: 40, marginRight: 10, borderRadius: 20}}/>

                <View
                    style={{flexDirection: 'column', flex: 1, alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                    <Text style={{fontSize: 16, alignSelf: 'flex-start'}}>{item.name}</Text>
                    {
                        item.lastMessage &&
                        <Text style={{
                            fontSize: 12,
                            alignSelf: 'flex-start',
                            color: '#444'
                        }}>{item.lastMessage.text}</Text>
                    }
                </View>

                <View>
                    <Text style={{color: "#888", fontSize: 10}}>5m</Text>
                </View>

            </ListItem>
        );
    };

    render() {
        return (
            <Container>
                <Header>
                    <Left/>
                    <Body>
                    <Title>Inbox</Title>
                    </Body>
                    <Right>
                        <Button onPress={this.logout.bind(this)}>
                            <Text>Logout</Text>
                        </Button>
                    </Right>
                </Header>
                <Content>
                    <List>
                        <FlatList
                            data={this.state.inbox}
                            extraData={this.state}
                            keyExtractor={(item, index) => `${item.id}`}
                            renderItem={this.renderListItem.bind(this)}
                        />
                    </List>
                </Content>
            </Container>
        );
    }
}

export default Inbox;