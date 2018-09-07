import React from "react";
import {
    Container,
    Content,
    Form,
    Item,
    Label,
    Input,
    Button,
    Header,
    Left,
    Right,
    Body,
    Text,
    Title, Icon
} from "native-base";
import {NavigationActions, StackActions} from "react-navigation";
import * as firebase from "firebase";
import {Image, TouchableOpacity, View} from "react-native";
import {Permissions, ImagePicker} from "expo";

class Register extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: "User Name",
            email: "",
            password: "password",
            default_picture: 'https://eabiawak.com/wp-content/uploads/2017/07/photo.png'
        };
    }

    onChangeName = name => this.setState({name});
    onChangeEmail = email => this.setState({email});
    onChangePassword = password => this.setState({password});

    createConnections(user, onDone) {
        console.warn(user);
        let {uid} = user;
        let userRefs = firebase.database().ref(`users`);
        userRefs.once('value', snapshot => {
            let users = snapshot.val();
            let keys = Object.keys(users);
            console.warn(keys);
            keys.map(key => {
                let toUser = users[key];
                toUser.uid = key;
                if (key !== uid) {
                    this.addToFriendList(user, toUser);
                }
            });
            onDone();
        })
    }

    addToFriendList(user, toUser) {

        let myRef = firebase.database().ref(`users/${user.uid}/friend_list`);
        let toRef = firebase.database().ref(`users/${toUser.uid}/friend_list`);
        let conversationRef = firebase.database().ref(`conversation/`);
        let conversationObj = conversationRef.push({
            user_one: user.uid, user_two: toUser.uid, chat: []
        });

        myRef.push({user_id: toUser.uid, conversation_id: conversationObj.key, name: toUser.name})
        toRef.push({user_id: user.uid, conversation_id: conversationObj.key, name: user.name})

    }

    register = () => {
        const {name, email, password} = this.state;
        firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then(userCredentials => {
                let uid = userCredentials.user.uid;
                let userRef = firebase.database().ref(`users/${uid}`);
                let user = {name, email, friendList: []};

                this.uploadImage(uid, res => {
                    firebase.auth().currentUser.updateProfile({
                        displayName: name
                    }).then(() => {
                        userRef.set(user, res => {
                            user.uid = uid;
                            this.createConnections(user, () => {
                                const resetAction = StackActions.reset({
                                    index: 0,
                                    actions: [NavigationActions.navigate({routeName: "Inbox"})]
                                });
                                this.props.navigation.dispatch(resetAction);
                            });
                        }).then(res => {
                            console.warn(res);
                        });
                    }, error => {
                        console.log(error.message);
                    });
                });
            })
            .catch(error => {
                alert(error.message);
            });
    };

    goToLogin = () => {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: "Login"})]
        });
        this.props.navigation.dispatch(resetAction);
    };

    async uploadImage(uid, onDone) {
        const response = await fetch(this.state.default_picture);
        const blob = await response.blob();
        let ref = firebase.storage().ref(`images/${uid}/dp.png`);
        let result = ref.put(blob);
        result.then(res => {
            console.warn(res);
            onDone(res);
        }).catch(err => {
            alert(err.message);
        });
    }

    onDefaultImage = async () => {

        let cameraRollPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (cameraRollPermission.status === 'granted') {
            let cameraPermission = await Permissions.askAsync(Permissions.CAMERA);
            if (cameraPermission.status === 'granted') {

                let result = await ImagePicker.launchImageLibraryAsync({
                    allowsEditing: true,
                    aspect: [4, 3],
                });
                if (!result.cancelled) {
                    this.setState({default_picture: result.uri});
                }

            } else alert("Camera permission required to select picture");
        } else alert("Camera Roll permission required to select picture");

    };

    render() {
        return (
            <Container>
                <Header>
                    <Left>
                        <Button transparent onPress={() => this.props.navigation.goBack()}>
                            <Icon name='arrow-back'/>
                        </Button>
                    </Left>
                    <Body>
                    <Title>Register</Title>
                    </Body>
                    <Right/>
                </Header>
                <Content>

                    <View style={{padding: 15, justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableOpacity onPress={this.onDefaultImage.bind(this)}>
                            <Image source={{uri: this.state.default_picture}}
                                   style={{width: 100, height: 100, borderRadius: 50}}/>
                        </TouchableOpacity>
                    </View>

                    <Form>
                        <Item fixedLabel>
                            <Label>Name</Label>
                            <Input
                                placeholder={"Name"}
                                value={this.state.name}
                                onChangeText={this.onChangeName.bind(this)}
                            />
                        </Item>
                        <Item fixedLabel>
                            <Label>Email</Label>
                            <Input
                                placeholder={"Email"}
                                value={this.state.email}
                                onChangeText={this.onChangeEmail.bind(this)}
                            />
                        </Item>
                        <Item fixedLabel last>
                            <Label>Password</Label>
                            <Input
                                placeholder={"Password"}
                                value={this.state.password}
                                onChangeText={this.onChangePassword.bind(this)}
                                secureTextEntry
                            />
                        </Item>
                    </Form>
                    <Button block onPress={this.register.bind(this)}>
                        <Text>Register</Text>
                    </Button>
                    <Button block transparent onPress={this.goToLogin.bind(this)}>
                        <Text>Already have an account? Login</Text>
                    </Button>
                </Content>
            </Container>
        );
    }
}

export default Register;