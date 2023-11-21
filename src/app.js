const express = require("express");
const date = require('date-and-time');
const app = express();
const path = require("path");
const db = require("@prisma/client");
const fetch = require("node-fetch-native");
require('dotenv').config();

const t_bot_key = process.env.TELEGRAM_BOT_KEY;
const t_chat_id =  process.env.TELEGRAM_CHAT_ID;
const smsc_login = process.env.SMSC_LOGIN;
const smsc_passw =  process.env.SMSC_PASSW;

const prisma = new db.PrismaClient();

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(3000, async () => {
    console.log(` app listening on port port! 3000 /n http://localhost:port`);
    setInterval(async () => {await smsCenter()}, 600000);
    setInterval(async () => { await messaging() }, 300000);

});

let alertDate = null;

async function messaging() {
    if (alertDate != null && alertDate.getTime() === (new Date(getDate())).getTime()) { return };
    const record = await prisma.smscStat.findFirst({
        where: {
            date:
            {
                gte: new Date(getDate())
            }
        },
    })

    if (record == null) { return };

    console.log(record);

    if (record.suspiciousCount > 3 || record.totalCount > 99) {
        console.log("send message");
        await fetch("https://api.telegram.org/bot" + t_bot_key + "/sendMessage?chat_id=" + t_chat_id + "&text=" + "Подозрительная активность в СМС-центре. Количество сомнительных сообщений сегодня: " + record.suspiciousCount + ". Доставленных сообщений за сегодня: " + record.totalCount)
        alertDate = new Date(getDate());
    }
}

async function smsCenter() {
    console.log("start suspiciousCount");
    let suspiciousCount = await smsCenterCheck();
    console.log("start totalCount");
    let totalCount = await smsCenterTotalCheck();

    console.log("suspiciousCount= " + suspiciousCount);
    console.log("totalCount=" + totalCount);

    const record = await prisma.smscStat.findFirst({
        where: {
            date:
            {
                gte: new Date(getDate())
            }
        },
    })

    if (record != null) {
        await prisma.smscStat.update({
            where: { id: record.id },
            data: {
                suspiciousCount: suspiciousCount,
                totalCount: totalCount
            },
        })
    } else {
        await prisma.smscStat.create({
            data: {
                date: new Date(),
                suspiciousCount: suspiciousCount,
                totalCount: totalCount
            },
        })
    }
}

async function smsCenterCheck() {
    let dateStr = date.format(new Date(), 'DD.MM.YYYY');
    let suspiciousCount = 0;
    let url = "https://smsc.ru/sys/get.php?get_messages=1&login=" + smsc_login + "&psw=" + smsc_passw + "&start=" + dateStr + "&cnt=1000";

    const resp = await fetch(url);
    const buffer = await resp.arrayBuffer();
    let res = new TextDecoder('windows-1251').decode(buffer);
    try {
        suspiciousCount = res.match(/Запрещено/g).length;

    }
    catch { }
    return suspiciousCount;
}

async function smsCenterTotalCheck() {
    let dateStr = date.format(new Date(), 'DD.MM.YYYY');
    let totalCount = 0;
    let url = "https://smsc.ru/sys/get.php?get_stat=1&login=" + smsc_login + "&psw=" + smsc_passw + "&start=" + dateStr + "&end=" + dateStr + "&cnt=1000";

    const resp = await fetch(url);
    const buffer = await resp.arrayBuffer();
    let res = new TextDecoder('windows-1251').decode(buffer);


    try {
        totalCount = parseInt(res.split(',')[1].replace(/\D/g, ""));
    }
    catch { }

    return totalCount;
}




function getDate() {
    givenDate = new Date();
    const offset = givenDate.getTimezoneOffset();
    givenDate = new Date(givenDate.getTime() - offset * 60 * 1000);
    return givenDate.toISOString().split('T')[0];
};
