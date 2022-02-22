# Binato [![CodeFactor](https://www.codefactor.io/repository/github/tgpethan/binato/badge/master)](https://www.codefactor.io/repository/github/tgpethan/binato/overview/master)
An implementation of osu!bancho in Javascript

i'm sorry peppy
<hr>

### Features:
 - Multiplayer + Invites
 - Spectator
 - Tourney Client
 - User Panel
 - Friends List
 - Chat & Channels
 - Private Messages
 - Minimum Viable Product of a bot
   - For a command list check [BotCommandHandler](https://github.com/tgpethan/Binato/blob/master/server/BotCommandHandler.js) or use !help on a live server
 
### [List of bugs](https://github.com/tgpethan/Binato/issues?q=is%3Aopen+is%3Aissue+label%3Abug)

## Support:
While I don't support setting this up yourself (although this is pretty flexible as it stands right now) I will try my best to support this in the time I have. Just make sure you have general knowlage of databases (MySQL in this case) and javascript.

Just open a discussion and I will get around to it eventually.

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

### 2016 - Early 2021:
Versions of osu! past Stable Fallback use HTTPS and as such you'll have to create a self signed certificate and make the server identify as ppy.sh<br>
In 2018 there were also new subdomains added which are: 
 - c2.ppy.sh
 - c3.ppy.sh
 - c4.ppy.sh
 - c5.ppy.sh
 - c6.ppy.sh
 - ce.ppy.sh

### Now:
On cuttingedge there is a `-devserver` launch flag which can be passed to the client to connect to a specific server. Example usage:
There is a `-devserver` launch flag in the game which can be passed to the client to connect to a specific server. Example usage:
```
osu!.exe -devserver eusv.ml
```
 
## Things not included in this repo:
### Profile Pictures:
Profile pictures can be handled by any standard HTTP server, there is also one I made for the task here: [Binato-ProfilePicture](https://github.com/tgpethan/Binato-ProfilePicture)
