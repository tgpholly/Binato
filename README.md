# Binato [![CodeFactor](https://www.codefactor.io/repository/github/tgpholly/binato/badge)](https://www.codefactor.io/repository/github/tgpholly/binato)
An implementation of osu!Bancho in TypeScript

I'm sorry peppy
<hr>

### Features:
 - Multiplayer + Invites
 - Spectator
 - Tourney Client support
 - User Panel
 - Friends List
 - Chat & Channels
 - Private Messages
 - Chat Bot (see [commands folder](https://git.eusv.net/tgpholly/Binato/src/branch/master/server/commands))
   
### [Planned additions](https://git.eusv.net/tgpholly/Binato/issues?q=&type=all&sort=relevance&labels=21&state=open&milestone=0&project=0&assignee=0&poster=0) | [List of currently known bugs](https://git.eusv.net/tgpholly/Binato/issues?q=&type=all&sort=relevance&labels=19&state=open&milestone=0&project=0&assignee=0&poster=0)

<hr>

## Setup:
While I don't support setting this up yourself, it is fairly easy to do.

All that should be required is:
 - **NodeJS > 25**
 - **MariaDB**
 - Optional (Disabled via config):
   - **Redis**
   - **Prometheus**

Clone the repo and run `npm i` to install required packages, then copy `config.example.json` to `config.json` and edit to your liking (this is where http compression, prometheus and redis can be enabled/disabled)

After doing this running `npm run dev` should start the server.

If you want to build something standalone, you can run the build process using `npm run build`.

## Reporting bugs:
To report a bug [create a new issue](https://git.eusv.net/tgpholly/Binato/issues/new) and include information such as your OS / Distro, Node version, disabled Binato features (e.g. Prometheus, Redis, compression) and console output at the time of the bug if applicable.

<hr>

## How to connect:
See **2022 - Now** for the preferred way to connect now.

### Before 2013:
Bancho was historically implemented using a raw TCP socket, and was [switched to HTTP with a queue serverside so it could be put through Cloudflare for DDOS protection.](https://blog.ppy.sh/post/61639194302/stopping-a-ddos)

In theory this means that this server should be able to communicate with older clients as the protocol is practically identical, however this is not currently supported.

### 2013 - Stable Fallback (2015 / 2016 ?):
From 2013 to the Fallback client, HTTP can be used, so for that you just need to direct it to the server<br>
You can do this using the hosts file.

Location on Linux: `/etc/hosts`<br>
Location on Mac: `/private/etc/hosts`<br>
Location on Windows: `C:\Windows\system32\drivers\etc\hosts`

Add an entry in the hosts file that looks like the following:
```
<server_ip> c.ppy.sh c1.ppy.sh
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

Add an entry in the hosts file that looks like the following:
```
<server_ip> c.ppy.sh c1.ppy.sh c2.ppy.sh c3.ppy.sh c4.ppy.sh c5.ppy.sh c6.ppy.sh ce.ppy.sh
```

### 2022 - Now:
There is a `-devserver` launch flag in the game which can be passed to the client to connect to a specific server. Example usage:
```
osu!.exe -devserver example.com
```
You need to have your subdomains structured like osu!'s with the exception of `c*.ppy.sh` domains. There is only one that is polled for `-devserver` usage.

An example setup would be:
 - osu.example.com (Score submit & web stuff)
 - c.example.com (Bancho)
 - a.example.com (Profile pictures)

In addition to all of this, your domain **must** have HTTPS. I recommend [Cloudflare](https://www.cloudflare.com/) for this task.

As this is just a launch flag on the client, the hosts entries are no longer required.
<hr>

## Other Binato components:
### Website:
Binato's website is handled by [Binato-Website](https://git.eusv.net/tgpholly/Binato-Website)
### Profile Pictures:
Profile pictures can be handled by any standard HTTP server, there is also one I made for the task here: [Binato-ProfilePicture](https://github.com/tgpholly/Binato-ProfilePicture)
