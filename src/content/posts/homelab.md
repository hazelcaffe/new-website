---
title: "How I Run my Homelab"
subtitle: "Proxxmoxxx <3"
date: 06-23-2026
tags: ["server", "homelab", "proxmox"]
image: "/cover/pve.png"
---

Let's just get into it :p

## Hardware
|  |  |
| --- | --- |
| ![fastfetch](/cover/fastfetch.png) | ![server](/cover/server.png) |

I have PVE running on a Dell Precision T5810 with:
- A Xeon E5-2687W v4 (3GHz, 12c/24t)
- 32GB DDR4 (ECC SO-DIMM) RAM
- NVIDIA Quadro K620 (2GB DDR3 VRAM)
- 6 Storage devices
    - Boot device is a 256GB Samsung SSD
    - I have a 512GB NVMe SSD connected via PCIe adapter I use for additional PVE storage (VMs, CTs, ISOs, etc.)
    - 4 HDDs for various storage
        - 2TB HDD, 1TB HDD, 1TB external USB HDD, 2TB HDD connected via a USB adapter lol

My router is a TP-Link AX3000

## Infrastructure
- (Obviously) I run PVE as my host OS. 
- I use [Technitium](https://technitium.com/dns/) as my DNS server. I've ran both Pihole and Adguard Home before and I love Technitium the most because, in my opinion, it's the best option for people who want their DNS to just work while being very configurable. I really like itz "Zones" feature which allows me to easily create custom LAN-only domains like https://pve.lab. 
- I run my own Root CA via [Step-CA](https://smallstep.com/docs/step-ca/). I do this so I get easy SSL on LAN domains like https://pve.lab. 
- I run [Caddy](https://caddyserver.com/) as my reverse proxy because I'm lazy and stupid and don't know how to use Nginx :(. 
- I use [Tailscale <3](https://tailscale.com/) as my remote access solution. I also use [Apache Gaucamole](https://guacamole.apache.org/) for RDP/VNC remote access.
- For any sort of public access thing I have I use Cloudflare.
- Other utilities I run are things like [File Browser](https://github.com/filebrowser/filebrowser) and [Libre Speedtest](https://github.com/librespeed/speedtest). I'd like to run a speedtest tracker, but for some reason every product I've used as incorrectly reported my internet speed? I have 1gig, and I get 1gig when running [speedtest](https://www.speedtest.net/), but everything says I have like 300mbps?? I really don't know why, poor server locations I'm guessing.

## Torrenting
The best bitTorrent client is qBittorrent so I run it in an LXC CT. Obviously I don't want my ISP to kill me so I use ProtonVPN (via a WG config). IMO Proton is the 2nd best VPN available, Mullvad obviously being the 1st.
I run a complete arr stack!
- Prowlarr
- Sonarr
- Radarr
- Lidarr

If you don't know, [*arr](https://wiki.servarr.com/) is a suite of software designed to make automation of torrents easy, I think. Prowlarr is a torrent index manager, sonarr is a TV show manager, Radarr is a movie manager, and Lidarr is a music manager. I don't use Radarr or Sonarr for anime though, it's great with them. I just manually load torrents from [nyaa.si](https://nyaa.si) instead!

## Selfhosted Media
### TV & Movies
I, of course, run [Jellyfin](https://jellyfin.org/)! It's THE best option. If you use Plex you SUCK!! I also run [Jellyseerr](https://github.com/TooGoooD1/jellyseerr) to make finding and requesting media even easier.

### Cloud Storage
I really wanted to use [Nextcloud](https://nextcloud.com/), but it was just too bulky and slow for me. Currently I run [Copyparty](https://github.com/9001/copyparty) for both my [public](https://qwq.sh) and private file storage. In the future I want to experiment with different options for my private file storage though. I've always liked the idea of running a public file server for various things, someone might find it useful one day. I'd love to run an Arch mirror, but they wont approve my account creation request :(

### Books/Manga
I have yet to actually create a book/eBook, comic, and audiobook setup, but I have my manga setup down pretty good! I'm running [Kavita](https://www.kavitareader.com/) as my server, but that obviously doesn't supply the content. For downloading manga I use a really awesome program called [Tranga](https://github.com/C9Glax/tranga) which downloads manga from sites like [MangaDex](https://mangadex.org/) and it works great!

### Music
Suprisingly, selfhosting music is pretty complicated!! 

- Lidarr
    - As I mentioned earlier, Lidarr is an *arr software for managing music. However, I don't torrent my music. Unfortunately, it just doesn't work. Like yes it "works", but 99% of the music you try to download with it it just won't find! So instead, I use Soulseek!
- Soulseek
    - If you don't know, Soulseek is a free file sharing network. It's most commonly used for sharing music. I use a program called [slskd](https://github.com/slskd/slskd) for interacting with it. I use [Soularr](https://soularr.net/) for managing slskd from Lidarr. It's an awesome script that takes the music you've queued from Lidarr, and searches and downloads it in slskd. 
- Navidrome
    - [Navidrome](https://www.navidrome.org/) is one of the only options for selfhosting music streaming. I only use it as my server though, the UI sucks. I use [Feishin](https://github.com/jeffvli/feishin) as my frontend, it's pretty good! I do have to admit I don't primarly selfhost my music though, I do pay for and use Apple Music :(

### Photos
I use [Immich](https://immich.app/)! While it's not my primary solution, I use it as a backup solution and for situations when I can't access iCloud. My primary solution is a $1/m iCloud subscription. Normally I wouldn't pay for something like this, but since I own pretty much all Apple products the sync is like a drug.

## Other
### Game Servers
Sometimes I have a 2 week MC phase and want to play with friends. While I could host a MC server without any bullshit like a chad, I'm a chud and paid for [Amp](https://cubecoders.com/AMP) because it looked cool.

### AI
While I'd like to selfhost AI one day, currently my wallet is telling me no! I do run [OpenWebUI](https://github.com/open-webui/open-webui) though because I got access to Palantir AIP somehow, pretty weird but cool.

### Server Dashboard
I run [Homepage](https://gethomepage.dev/) as my, well, server homepage :p
|  |  |  |
| --- | --- | --- |
| ![page 1](/cover/hp-1.png) | ![page 2](/cover/hp-2.png) | ![page 3](/cover/hp-3.png) |

### Remote Desktop
I have two VMs running that just act as remote PCs. I run a Windows 10 IoT LTSC VM and a Arch VM running XFCE4.

### Email
This isn't something running on my homelab, but I run on my Greencloud VPS I pay $45/y for. I LOVE [Mailcow](https://mailcow.email/)!!!! I also have a [10/10 score on mail-tester](https://mail-tester.com/test-c9z560f6z) >:D

### Link Shortening
I don't actually run a dedicated program for this, instead I just built the feature into my website and manage it via a Discord bot :p

### :p
I have a Debian 13 container I use for programs or scripts I make that I don't want to give their own VM or CT. Things like Discord bots and this website!

### Things I’d Like to Run In the Future
Currently, I don't have an uptime solution 😭. While I do have [Uptime Kuma](https://uptimekuma.org/) running in a cloud VPS, it's currently broken and I don't feel like fixing it. In addition, because of my location sometimes my ISP goes out rather frequently and seeing 500 reds just because my ISP down is annoying. It' REALLY annoying when you have notifications on too.

I also want to get a proper notification system going. I use to run [ntfy](https://ntfy.sh/), but it doesn't appear to be able to send push notifications on iOS. I'll probably sit down one day and just configure a bunch of Discord webhooks :p

## If You're Reading This
First of all, you read my blog post!! Woah, thank you!! If you'd like access to things like my Jellyfin, Kavita, Navidrome, or email, please shoot me an email!! I give my friends access, but I'm more than happy to give anyone who asks access!! I love knowing that something I'm running is providing use to someone else. Also, if you're thinking about running a homelab, having an issue with selfhosting, or have any questions about my homelab, please feel free to ask me! I'd love to help :D