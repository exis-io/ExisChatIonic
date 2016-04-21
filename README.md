# Exis + Ionic Chat App Tutorial

Exis is a BaaS startup based out of Madison WI, the same hometown as Ionic. Exis is a platform that offers developers an easy set of tools for quickly developing their application and getting it out to market. Exis provides a set of free microservices such as user login and authentication, plug and play NoSQL-based cloud storage, cloud hosting of custom Node.JS backends, and a unique take on WebSockets that offers fully authenticated bi-directional messaging both peer-to-peer and with backend components. Exis has created and released ngRiffle a client-side library that integrates with Ionic and has recently been teaming up with Ionic to show just how simple app development can be when you combine the two. Exis gave a demonstration at Ionic Headquarters in March showcasing the following tutorial.

Following this tutorial will result in creating a simple chat app using Exis + Ionic. This tutorial will showcase some of the core features that make using Exis + Ionic an excellent choice for app development including publish and subscribe messaging, and running a simple Node.js server hosted on Exis.

## Get Up and Running!
### Step 1
[Register](https://exis.io/register) for a free [Exis](https://exis.io) account or [login](https://exis.io/login) if you already have one.
### Step 2
Create a new app named "chat"
![Create App](http://my.exis.io.s3-website-us-west-2.amazonaws.com/assets/img/tutorials/templates/web_create_app.png)
### Step 3
Add an **Auth** appliance

**Use the options:** *Temporary (name, no password)* for the *User account type*

This appliance controls who is allowed to communicate with your backend.
![Auth](http://my.exis.io.s3-website-us-west-2.amazonaws.com/assets/img/tutorials/templates/web_attach_auth.png)
### Step 4
Clone the Ionic App
```bash
git clone https://github.com/exis-io/ExisChatIonic.git
cd ExisChatIonic
bower install
```
### Step 5
Link your Ionic App to the Exis App you just created

Replace `USERNAME` with your Exis username in `xs.demo.USERNAME.chat` in `www/js/app.js` line 43:

```javascript
.config(function($riffleProvider){
    $riffleProvider.SetDomain("xs.demo.USERNAME.chat");
})
```
### Step 6
Run the Ionic App!

```bash
ionic serve
```

Open the app in multiple tabs and chat away!

![Ionic app](http://my.exis.io.s3-website-us-west-2.amazonaws.com/assets/img/tutorials/ionic/ionic-chat.png)

### Congrats on building a chat app using Exis + Ionic!!

**A step by step explanation of our code is provided below.**

## Learn How It Works!
### Topics

1. [The Code](#The Code)
2. [Launching A Node.js Backend](#Launching A Node.js Backend)

## The Code

Let's take a quick look at the main logic of the chat app which is in `www/js/controller.js`.
```javascript
angular.module('exisChat.controller', []) 

.controller('HomeCtrl', function($scope, $riffle, $ionicScrollDelegate) {

  $scope.msgs = []; 

  //Login anonymously to Exis (requires Auth appliance level 0)
  $riffle.login();

  //subscribe to the chat channel
  $riffle.subscribe('exisChat', gotMsg);

  //handle messages here
  function gotMsg(msg){
    msg.received = true;
    displayMsg(msg);
  }
   
  //publish message
  $scope.sendMsg = function(text){
    var msg = {username: $riffle.user.username(), msg: text}
    $riffle.publish('exisChat', msg);
    $scope.input.msg = ''; 
    displayMsg(msg);
  }

  //display our msg
  function displayMsg(msg){
    $scope.msgs.push(msg);
    $ionicScrollDelegate.scrollBottom();
  }
});

```

That's it! Seriously. That is what a chat app looks like with Exis + Ionic. Let's dive in a little!

**Here are the basics.**

**line 8:** [$riffle.login()](https://exis.io/docs/API-Reference/ngRiffle#-riffle-login) anonymously logs in the user as long as there is an [Auth](https://exis.io/docs/appliances/Auth) appliance with level 0 attached to the app.

**line 11:** [$riffle.subscribe('exisChat', gotMsg)](https://exis.io/docs/API-Reference/ngRiffle#-riffle-subscribe) subscribes our `gotMsg` function to handle events publish to the `exisChat` channel.
`gotMsg` simply receives the msg marks it as a received message and displays it. You can look at the view code in `www/templates/home.html`.

**line 22:** [$riffle.publish('exisChat', msg)](https://exis.io/docs/API-Reference/ngRiffle#-riffle-publish) publishes the message we are sending to anyone subscribed to the `exisChat` channel.
It's called inside the `sendMsg` function which is bound to the send button in the view and it simply creates the message object, publishes it, and displays it.

**line 28:** `displayMsg` is simply a utility function used to add the msg the `$scope.msgs` array which is bound to the view. It also scrolls the screen down as new messages are received or sent.

And there you have it! Pretty simple right?!? There is a couple more things you can do below if you want to get a little fancy!

## Launching a Node.js Backend

Let's take a quick look at how you could attach your own Node.js backend if you wanted. The simple backend we wrote will simply listen to messages that people are publishing and log them
but you can fork our repo and and add whatever cool imaginative logic you'd like. We'll start with our simple logging server though.

**Fork the [ExisChatBackend](https://github.com/exis-io/ExisChatBackend.git) Repo**

**Go to the [Appliance Store](https://exis.io/app/chat/appliances) and attach the [Container](https://exis.io/docs/appliances/Container) appliance to your app.**

![Container](http://my.exis.io.s3-website-us-west-2.amazonaws.com/assets/img/tutorials/templates/web_attach_container.png)

**Go to [Container Management](https://exis.io/app/ionic/appliances)**

**Build the image** by passing in your *forked* repo URL of [ExisChatBackend](https://github.com/exis-io/ExisChatBackend.git) from above, name it `exischat`.

![Build Image](http://my.exis.io.s3-website-us-west-2.amazonaws.com/assets/img/tutorials/templates/web_container_buildimage.png)

**Create the image** from the dropdown on the left, call it `logger`.

![Create Image](http://my.exis.io.s3-website-us-west-2.amazonaws.com/assets/img/tutorials/templates/web_container_createimage.png)

**Start the container** by pressing the `Start` button below.

![Start Image](http://my.exis.io.s3-website-us-west-2.amazonaws.com/assets/img/tutorials/templates/web_container_startimage.png)

**Now messages you send on your Exis + Ionic chat app will be logged by your backend! To verify this you can send a few messages and then go to the Logs tab on your container.**
Assuming you forked our repo like we suggested you can modify the `server.js` code locally and push your changes to your forked repo on Github and then simply update the image to see your
changes reflected.

### Thanks for following this tutorial! Feel free to fork the repos and modify this app at you leisure! And if you'd like to show us what you did or you have any questions feel free to email us at [developers@exis.io](mailto:developers@exis.io)
