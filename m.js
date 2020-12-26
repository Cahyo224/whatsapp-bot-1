const {
    WAConnection,
    MessageType,
    Presence,
    MessageOptions,
    Mimetype,
    WALocationMessage,
    WA_MESSAGE_STUB_TYPES,
    ReconnectMode,
    ProxyAgent,
    waChatKey,
} = require("@adiwajshing/baileys");
const qrcode = require("qrcode-terminal");
const moment = require("moment-timezone");
const cheerio = require("cheerio");
const imageToBase64 = require('image-to-base64');
const get = require('got')
const fs = require("fs");
const fetch = require('node-fetch');
const urlencode = require("urlencode");
const axios = require("axios").default
const syntaxerror = require('syntax-error')
const path = require('path')
const util = require('util')
const figlet = require('figlet');


var color = (text, color) => {
    switch (color) {
        case 'red':
            return '\x1b[31m' + text + '\x1b[0m'
        case 'yellow':
            return '\x1b[33m' + text + '\x1b[0m'
        default:
            return '\x1b[32m' + text + '\x1b[0m'
    }
}

//-----------------------core--------------------//

const conn = new WAConnection()
conn.on('qr', qr => {
    console.log('FNBOTS AUTHENTICATING....');
    qrcode.generate(qr, {
        small: true
    });
});
conn.on('credentials-updated', () => {
    const authInfo = conn.base64EncodedAuthInfo()
    fs.writeFileSync('./fnbots.json', JSON.stringify(authInfo, null, '\t'))
})
fs.existsSync('./fnbots.json') && conn.loadAuthInfo('./fnbots.json')
conn.connect();

//-----------------------core--------------------//

console.log('---------------------------------------------------------------------------')
console.log(color(figlet.textSync('FN BOTS WA', {
    horizontalLayout: 'full',
    verticalLayout: 'full'
})))
console.log('---------------------------------------------------------------------------')

conn.on('message-new', async(m) => { fnbots(conn, m, false)
});
//-----------------------util--------------------//

String.prototype.format = function () {
    var a = this;
    for (var k in arguments) {
        a = a.replace(new RegExp("\\{" + k + "\\}", 'g'), arguments[k]);
    }
    return a
}

function waktu(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

function arrayRemove(arr, value) {
    return arr.filter(function (ele) {
        return ele != value;
    });
}

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function shuffle(arr) {
    let i = arr.length - 1;
    for (; i > 0; i--) {
        const j = Math.floor(Math.random() * i)
        const temp = arr[i]
        arr[i] = arr[j]
        arr[j] = temp
    }
    return arr;
}

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function fnbots(conn, m, asu) {
    try {
        const {
            messageStubParameters,
            labels,
            key,
            message,
            messageTimestamp,
            status,
            participant,
            ephemeralOutOfSync,
            epoch
        } = m
        if (!m.message) return
        if (m.key && m.key.remoteJid == 'status@broadcast') return
        if (m.key.fromMe) return
        const messageContent = JSON.stringify(m.message)
        const toId = m.key.remoteJid
        const {
            text,
            extendedText,
            contact,
            location,
            liveLocation,
            image,
            video,
            sticker,
            document,
            audio,
            product
        } = MessageType
        const prefix = "."
        const type = Object.keys(m.message)[0]
        const isUrl = (url) => {
            return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
        }
        const sendReply = (toId, teks) => {
            conn.sendMessage(toId, teks, text, {
                quoted: m
            })
        }
        const sendText = (toId, teks) => {
            conn.sendMessage(toId, teks, text)
        }
        const getGroupAdmins = (participants) => {
            admins = []
            for (let i of participants) {
                i.isAdmin ? admins.push(i.jid) : ''
            }
            return admins
        }
        let body = ""
        if (type == 'conversation') {
            body = m.message.conversation
        } else if (type == 'imageMessage') {
            body = m.message.imageMessage.caption
        } else if (type == 'videoMessage') {
            body = m.message.videoMessage.caption
        } else if (type == 'extendedTextMessage') {
            body = m.message.extendedTextMessage.text
        }
        body = body
        let txt = body.toLowerCase()
        const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
        const jam = moment.tz('Asia/Jakarta').format('HH:mm:ss')
        const isGroup = toId.endsWith('@g.us')
        const isMedia = (type === 'imageMessage' || type === 'videoMessage')
        const isQuotedImage = type === 'extendedTextMessage' && messageContent.includes('imageMessage')
        const isQuotedVideo = type === 'extendedTextMessage' && messageContent.includes('videoMessage')
        const isQuotedSticker = type === 'extendedTextMessage' && messageContent.includes('stickerMessage')
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
        } else if (txt == "hi") {
            const teks = 'halo, hai juga'
            sendText(toId, teks)
        } else if (txt == "reply") {
            const teks = 'kenapa minta direply?'
            sendReply(toId, teks)
        } else if (txt == "tag") {
            if (isGroup) {
                var targ = m.participant
                const tag = {
                    text: `@${targ.split("@s.whatsapp.net")[0]}`,
                    contextInfo: {
                        mentionedJid: [targ]
                    }
                }
                conn.sendMessage(toId, tag, text)
            } else {
                var targ = toId
                const tag = {
                    text: `@${targ.split("@s.whatsapp.net")[0]}`,
                    contextInfo: {
                        mentionedJid: [targ]
                    }
                }
                conn.sendMessage(toId, tag, text)
            }
        } else if (txt == "contact") {
            if (isGroup) {
                var targ = m.participant
                const vcard = 'BEGIN:VCARD\n' +
                    'VERSION:3.0\n' +
                    'FN:\n' +
                    'ORG:\n' +
                    'TEL;type=CELL;type=VOICE;waid='+targ.split("@s.whatsapp.net")[0]+':+'+targ.split("@s.whatsapp.net")[0]+'\n' +
                    'END:VCARD'
                conn.sendMessage(toId, {
                    displayname: "",
                    vcard: vcard
                }, MessageType.contact)
            } else {
                var targ = toId
                const vcard = 'BEGIN:VCARD\n' +
                    'VERSION:3.0\n' +
                    'FN:\n' +
                    'ORG:\n' +
                    'TEL;type=CELL;type=VOICE;waid='+targ.split("@s.whatsapp.net")[0]+':+'+targ.split("@s.whatsapp.net")[0]+'\n' +
                    'END:VCARD'
                conn.sendMessage(toId, {
                    displayname: "",
                    vcard: vcard
                }, MessageType.contact)
            }
        } else if (txt == "me") {
            if (isGroup) {
                const num = m.participant
                const picture = num.replace("@s.whatsapp.net", "")
                try {
                    pict = await conn.getProfilePicture(picture)
                } catch {
                    pict = 'https://user-images.githubusercontent.com/70086013/103155250-749abe00-47d0-11eb-82b1-5b3a4f3182f8.jpg'
                }
                const response = await axios({
                    method: "get",
                    url: pict,
                    responseType: 'arraybuffer'
                })
                let status = await conn.getStatus(picture)
                let teks = `Name: @${num.split('@')[0]}\n`
                teks += `Status: ${status.status}`
                conn.sendMessage(toId, response.data, MessageType.image, {
                    caption: teks,
                    contextInfo: {
                        "mentionedJid": [num]
                    }
                })
            } else {
                num = toId
                const picture = num.replace("@s.whatsapp.net", "")
                try {
                    pict = await conn.getProfilePicture(picture)
                } catch {
                    pict = 'https://user-images.githubusercontent.com/70086013/103155250-749abe00-47d0-11eb-82b1-5b3a4f3182f8.jpg'
                }
                const response = await axios({
                    method: "get",
                    url: pict,
                    responseType: 'arraybuffer'
                })
                let status = await conn.getStatus(picture)
                let teks = `Name: @${num.split('@')[0]}\n`
                teks += `Status: ${status.status}`
                conn.sendMessage(toId, response.data, MessageType.image, {
                    caption: teks,
                    contextInfo: {
                        "mentionedJid": [num]
                    }
                })
            }
        } else if (txt == "send audio") {
            const buffer = fs.readFileSync("audio.mp3")
            conn.sendMessage(toId, buffer, MessageType.audio, {
                mimetype: Mimetype.mp4Audio
            })
        } else if (txt == "send gif") {
            const buffer = fs.readFileSync("gif.mp4")
            conn.sendMessage(toId, buffer, MessageType.video, {
                mimetype: Mimetype.gif,
                caption: ""
            })
        } else if (txt == "send video") {
            const buffer = fs.readFileSync("video.mp4")
            conn.sendMessage(toId, buffer, MessageType.video, {
                caption: ""
            })
        } else if (txt == "send image") {
            const buffer = fs.readFileSync("image.jpg")
            conn.sendMessage(toId, buffer, MessageType.image, {
                caption: ""
            })
        }
        if (txt == "sticker") {
            if (isMedia && !m.message.imageMessage || isQuotedVideo) {
                const decryptMedia = isQuotedVideo ? JSON.parse(JSON.stringify(m).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : m
                const stiker = await conn.downloadAndSaveMediaMessage(decryptMedia)
                const {
                    spawn
                } = require("child_process");
                const anjay = await spawn('ffmpeg', ['-y', '-i', stiker, '-vcodec', 'libwebp', '-filter:v', 'fps=fps=12', '-lossless', '1', '-loop', '0', '-preset', 'default', '-an', '-vsync', '0', '-s', '150:150', './database/animated.webp'])
                anjay.on('close', function () {
                    let x = fs.readFileSync('./database/animated.webp')
                    conn.sendMessage(toId, x, MessageType.sticker)
                })
            } else if (isMedia && !m.message.videoMessage || isQuotedImage) {
                const decryptMedia = isQuotedImage ? JSON.parse(JSON.stringify(m).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : m
                const stiker = await conn.downloadAndSaveMediaMessage(decryptMedia)
                const {
                    exec
                } = require("child_process");
                exec('cwebp -q 50 ' + stiker + ' -o database/' + jam + '.webp', (error, stdout, stderr) => {
                    let stik = fs.readFileSync('database/' + jam + '.webp')
                    conn.sendMessage(toId, stik, MessageType.sticker)
                });
            }
        }
    } catch (err) {
        new Error(err)
    }
}