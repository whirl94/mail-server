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

const actions = [CREATE_ACCOUNT_MSG, LOGIN_MSG, LOGOUT_MSG, SEND_MSG, READ_MAILBOX_MSG,READ_MESSAGE_MSG,EXIT_MSG];

const actionQuestion = "> Please choose one action: ";
const createAccountQuestion = "New account credentials *username password*: ";
const loginQuestion = "Login credentials *username password*: ";
const sendMessageQuestion = "Send a message to other users *user1 user2 user3... \"message\"*: ";
const readMessageQuestion = "Read a message by giving the message id *id*: ";
const serverText = "\u001B[47m\u001B[30mserver:\u001B[0m ";
const differentUserText = "\u001B[31mA different client logged in with this user name, you have been logged out!\u001B[0m";
const serverErrorText="\u001B[31mThe server encountered an error: \u001B[0m";
const bye = "Thank you for using the service";

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
var newMailboxNotification = false;

socket.on("data", (data) => {
    var text = data.toString().trim();
    console.log( serverText + data);
    newMailboxNotification = false;

    if(text.startsWith("\u001B[32mOK:\u001B[0m " + LOGOUT_MSG)){
        isLoggedIn = false;
    }

    if(text.startsWith(FORCE_LOGOUT_MSG)){
        wasForcedLoggedOut = true;
        isLoggedIn = false;
    }

    if(text.startsWith("\u001B[32mOK:\u001B[0m " + LOGIN_MSG)){
        isLoggedIn = true;
    }

    if(text.startsWith(NEW_MESSAGE_IN_MAILBOX_MSG)){
        newMailboxNotification = true;
    }

    // start is called when the user types something -> see rl.question
    if(!text.startsWith("\u001B[33mconnecting...") && !wasForcedLoggedOut && !newMailboxNotification){
        start();
    }
});

socket.on("error", (error) => {
    console.log( serverErrorText + error.message );
    console.log("exiting...");
    process.exit();
});

function start(){
    wasForcedLoggedOut = false;

    if(isLoggedIn){
        selectOption(2, 6);
    }else{
        selectOption(0, 1);
    }
}

function selectOption(min, max){
    var question = actionQuestion;
    for (i = min; i <= max; i++) {
        question += "\n\u001B[33m" + i + ")\u001B[0m" + actions[i];
    }
    question += "\n";
    rl.question(question, (action) => {
        if (action >= min && action <= max) {
            if(wasForcedLoggedOut){
                console.log(differentUserText);
                start();
            }else{
                sendRequest(action); 
            }
            
        }
        else {
            console.log("Please choose an action ranged \u001B[33m" + min + " - " + max + "\u001B[0m\n");
            selectOption(min, max);
        }
    });
}

function sendRequest(input) {
    switch (input) {
        //create account
        case "0":
            sendInput(createAccountQuestion, CREATE_ACCOUNT_MSG);
            break;
        // login username password
        case "1":
            sendInput(loginQuestion, LOGIN_MSG);
            break;
        // logout
        case "2":
            sendMsg(socket, LOGOUT_MSG + "\n");
            break;
        // send users msg
        case "3":
            sendInput(sendMessageQuestion, SEND_MSG);
            break;
        // read mailbox
        case "4":
            sendMsg(socket, READ_MAILBOX_MSG + "\n");
            break;
        // read message id
        case "5":
            sendInput(readMessageQuestion, READ_MESSAGE_MSG);
            break;
        // exit
        case "6":
            console.log(bye);
            process.exit();
        default:
            console.warn("\ninput not known\n");
    }
}

function sendInput(question, message){
    rl.question( question, (input) => {
        // console.log(input);
        sendMsg(socket, message + " " + input + "\n");
    });
}

 function sendMsg(socket, text){
    socket.write(text);
}