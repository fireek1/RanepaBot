require('dotenv').config()
const telegramApi = require('node-telegram-bot-api')
const { Configuration, OpenAIApi } = require('openai')
const puppeteer = require('puppeteer')
const token = '***'
const bot = new telegramApi(token, { polling: true })
const openaiapi = new OpenAIApi(
    new Configuration({
        apiKey: process.env.API_KEY,
    })
)
const stickers = ['https://cdn.tlgrm.app/stickers/348/e30/348e3088-126b-4939-b317-e9036499c515/192/1.webp', 'https://cdn.tlgrm.app/stickers/348/e30/348e3088-126b-4939-b317-e9036499c515/192/2.webp', 'https://cdn.tlgrm.app/stickers/348/e30/348e3088-126b-4939-b317-e9036499c515/192/4.webp', 'https://cdn.tlgrm.app/stickers/348/e30/348e3088-126b-4939-b317-e9036499c515/192/11.webp', 'https://tlgrm.ru/_/stickers/348/e30/348e3088-126b-4939-b317-e9036499c515/192/38.webp', 'https://tlgrm.ru/_/stickers/348/e30/348e3088-126b-4939-b317-e9036499c515/192/34.webp', 'https://cdn.tlgrm.app/stickers/ebd/2fb/ebd2fb45-89e7-42ad-b8cb-c33e73cb39b2/192/5.webp', 'https://cdn.tlgrm.app/stickers/ebd/2fb/ebd2fb45-89e7-42ad-b8cb-c33e73cb39b2/192/2.webp', 'https://cdn.tlgrm.app/stickers/d21/e99/d21e9940-fc86-49ba-9d91-b20a71136040/192/8.webp', 'https://cdn.tlgrm.app/stickers/d21/e99/d21e9940-fc86-49ba-9d91-b20a71136040/192/10.webp', 'https://cdn.tlgrm.app/stickers/d21/e99/d21e9940-fc86-49ba-9d91-b20a71136040/192/9.webp', 'https://cdn.tlgrm.app/stickers/d21/e99/d21e9940-fc86-49ba-9d91-b20a71136040/192/4.webp']
const getHtml = async () => {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto('https://zf.ranepa.ru/news/novosti-filiala.php')
    await page.waitForSelector('.news-item-title')
const getNews = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.news-item-title'), el => el.innerText)
    })
    const News = getNews.slice(0, 10).join(', ')
    await browser.close()
    return News + 'Расскажи коротко об этих новостях РАНХиГС'
}
getHtml().then(data => {
    const history = [];
    bot.on('message', async (msg) => {
        history.push({role: 'user', content: `Обращайся ко мне как ${msg.from.first_name}`})
        if (msg.text === '/news')history.push({ role: 'user', content: data }) 
        else history.push({ role: 'user', content: msg.text })
        const response = await openaiapi.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: history
        })
        if (history.length >= 15) history.length = 0
        bot.sendMessage(msg.chat.id, response.data.choices[0].message.content)
        bot.sendSticker(msg.chat.id, stickers[Math.floor((Math.random() * stickers.length))])
    })
})