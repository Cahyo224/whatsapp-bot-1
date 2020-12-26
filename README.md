whatsapp bot using baileys module:

```
if (txt == "help") {
  let teks = "list menu\n\n"
  teks += "1. hi\n"
  teks += "2. reply\n"
  teks += "3. tag\n"
  teks += "4. contact\n"
  teks += "5. me\n"
  teks += "6. sticker"
  teks += "7. send audio\n"
  teks += "8. send video\n"
  teks += "9. send image\n"
  teks += "10. send gif"
  sendReply(toId, teks)
 }
 ```
 
installation:
git clone this repo
cd whatsapp-bot
npm i
node m.js
