---
title: "How to Get the New Siri Early"
subtitle: "On MacOS anyway"
date: 06-11-2026
tags: ["macos"]
image: "/cover/macos.png"
---

As you may know, at WWDC this year Apple spent 1/3rd of the event talking about Apple Intelligence. While I'm not a big AI person, I admittedly think Apple's AI is pretty cool! 
It's currently on a waitlist, so you have to wait to be approved, butttt if you have a device that can run the MacOS 27 dev beta, you can get it early!

## How
Open your terminal of choice and run:
```sh
$ sudo defaults write "/Library/Preferences/FeatureFlags/Domain/GenerativeModels.plist" "EnhancedSiriWaitlist" -dict-add Enabled -bool NO
```
Then reboot! (`sudo reboot`)

---

Once rebooted you should notice the new Siri app in your dock, and if you open system settings and go to the "Siri" tab you'll notice you have access!! Walaaa. Thanks to my friend (which I'm *prettyyy* sure he found this on Twitter) for showing me this.