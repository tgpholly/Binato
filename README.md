# Binato
An implementation of osu!bancho in Javascript
<hr>

### Features:
 - Multiplayer + Invites
 - Spectator
 - User Panel
 - Friends List
 - Chat & Channels
 - Private Messages
 - Minimum Viable Product of a bot
   - For a command list check [BotCommandHandler](https://github.com/tgpethan/Binato/blob/master/server/BotCommandHandler.js) or use !help on a live server
 
### [List of bugs](https://github.com/tgpethan/Binato/issues?q=is%3Aopen+is%3Aissue+label%3Abug)
 
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
