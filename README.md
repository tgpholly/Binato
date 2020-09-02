# Binato
An implementation of osu!bancho in Javascript
<hr>

### Features:
 - Multiplayer
 - Spectator
 - User Panel (Missing Friends)
 - Chat & Channels

### Currently unimplemented things:
 - Private Messages
 - Multiplayer Invites
 - Friends List
 - Bot
 
## Bugs:
 - If a client clicks the plus button in the chat window to join another channel the client will "crash", the game will keep running but the user will be unable to do anything
 - BinatoStream can create duplicate streams
 
## How to connect:

### 2013 - Stable Fallback (2015 / 2016 ?):
Stable fallback uses HTTP so for that you just need to direct it to the server<br>
You can do this using the hosts file

Location on Linux: /etc/hosts<br>
Location on Windows: C:/Windows/system32/drivers/etc/hosts

Add an entry in the hosts file that looks like the following:
```
<server_ip> osu.ppy.sh c.ppy.sh c1.ppy.sh
```
Where <server_ip> is the IP Address of the server hosting the bancho server

### 2016 - Now:
Versions of osu! past Stable Fallback use HTTPS and as such you'll have to create a self signed certificate and make the server identify as ppy.sh<br>
My personal choice for this task is OpenSSL + nginx

The subdomains you have to deal with are:
 - osu.ppy.sh
 - c.ppy.sh
 - c1.ppy.sh
 - c2.ppy.sh
 - c3.ppy.sh
 - c4.ppy.sh
 - c5.ppy.sh
 - c6.ppy.sh
 - ce.ppy.sh
 
 Using this with the hosts file should allow the server to be connected to by a modern osu! client
 
 Subdomains past c1.ppy.sh were added around 2018
 
 ## Things not included in this repo:
 ### Profile Pictures:
 Profile pictures can be handled by any standard HTTP server, there is also one I made for the task here: [Binato-ProfilePicture](https://github.com/tgpethan/Binato-ProfilePicture)
 ### DatabaseHelper.js:
 Because the DatabaseHelper in this server was so horrible and also very specific to my server I didn't include it.<br>
 I'll make a better one and include it eventually. For now if you feel like using this server you can make your own by handing the function getFromDB in a file called DatabaseHelper.js in the server folder
