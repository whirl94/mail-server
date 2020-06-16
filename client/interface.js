const net = require('net');
const readline = require('readline');

const CREATE_ACCOUNT_MSG = "create_account";
const LOGIN_MSG = "login";
const LOGOUT_MSG = "logout";
const SEND_MSG = "send";
const READ_MAILBOX_MSG = "read_mailbox";
const READ_MESSAGE_MSG = "read_message";
const EXIT_MSG = "exit";
const FORCE_LOGOUT_MSG = "force_logout";
const NEW_MESSAGE_IN_MAILBOX_MSG = "new_message_in_mailbox";

const actionQuestion = "Please choose one action: ";
const actions = [CREATE_ACCOUNT_MSG, LOGIN_MSG, LOGOUT_MSG, SEND_MSG, READ_MAILBOX_MSG,READ_MESSAGE_MSG,EXIT_MSG];
const createAccountQuestion = "Enter the desired username and password *username password*: ";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

var options = {
    port: 5432,
    host: "localhost"
}

var socket = new net.Socket();
socket.connect(options);
var isLoggedIn = false;
var wasForcedLoggedOut = false;

start();

function start(){
    wasForcedLoggedOut = false;

    if(isLoggedIn){
        getUserInput(2, 6);
    }else{
        getUserInput(0, 1);
        console.log("ajungerwqhrq");
    }
}

function getUserInput(min, max){
    var question = actionQuestion;
    for (i = min; i <= max; i++) {
        question += "\n" + i + ")" + actions[i];
    }
    question += "\n";
    rl.question(question, (action) => {
        if (action >= min && action <= max) {
            if(wasForcedLoggedOut){
                console.log("A different client logged in with this user, you have been logged out!");
                start();
            }else{
                sendRequest(action); 
            }
            
        }
        else {
            console.log("Please choose an action ranged " + min + " - " + max + "\n");
            getUserInput(min, max);
        }
    });

    rl.on("close", () => {

    });
}

async function sendRequest(input) {
    switch (input) {
        //create account
        case "0":
            getCredentials(createAccountQuestion, CREATE_ACCOUNT_MSG);
            break;
        // login username password
        case "1":
            getCredentials(createAccountQuestion, LOGIN_MSG);
            break;
        // logout
        case "2":
            sendMsg(socket, LOGOUT_MSG + "\n");
            break;
        // send users msg
        case "3":
            console.log(input);
            break;
        // read mailbox
        case "4":
            console.log(input);
            break;
        // read message id
        case "5":
            console.log(input);
            break;
        // exit
        case "6":
            console.log(input);
            process.exit();
        default:
            console.warn("\ninput not known\n");
    }
}

function getCredentials(question, message){
    rl.question( question, (credentials) => {
        console.log(credentials);
        sendMsg(socket, message + " " + credentials + "\n");
    });
}

async function sendMsg(socket, text){
    socket.write(text);
}

socket.on("data", (data) => {
    console.log( "----> server says: " + data);

    if(data.includes(LOGOUT_MSG) && data.includes("OK")){
        isLoggedIn = false;
    }

    if(data.includes(FORCE_LOGOUT_MSG)){
        wasForcedLoggedOut = true;
        isLoggedIn = false;
    }

    if(data.includes(LOGIN_MSG) && data.includes("OK")){
        isLoggedIn = true;
    }

    if(!wasForcedLoggedOut){
        start();
    }
});