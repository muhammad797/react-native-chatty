import React from "react";
import {
    Container,
    Content,
    Form,
    Item,
    Label,
    Input,
    Button,
    Text,
    Header,
    Left,
    Right,
    Body,
    Title
} from "native-base";
import * as firebase from "firebase";
import {StackActions, NavigationActions} from "react-navigation";

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: ""
        };
    }

    onChangeEmail = email => this.setState({email});
    onChangePassword = password => this.setState({password});

    login = () => {
        const {email, password} = this.state;
        firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then(res => {
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({routeName: "Inbox"})]
                });
                this.props.navigation.dispatch(resetAction);
            })
            .catch(error => {
                alert("Sorry, wasn't able to login. Please contact administration");
            });
    };

    goToRegister = () => {
        this.props.navigation.navigate("Register");
    };

    render() {
        return (
            <Container>
                <Header>
                    <Left/>
                    <Body>
                    <Title>Login</Title>
                    </Body>
                    <Right/>
                </Header>
                <Content>
                    <Form>
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
                    <Button block onPress={this.login.bind(this)}>
                        <Text>Login</Text>
                    </Button>
                    <Button block transparent onPress={this.goToRegister.bind(this)}>
                        <Text>New user? Register</Text>
                    </Button>
                </Content>
            </Container>
        );
    }
}

export default Login;