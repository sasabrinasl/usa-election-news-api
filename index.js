const PORT = process.env.PORT || 3080 // for deploying on heroku
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()

const newspapers = [
    {
        name: 'nytimes',
        address: 'https://www.nytimes.com/section/politics',
        base: 'https://www.nytimes.com'
    },
    {
        name: 'bbc',
        address: 'https://www.bbc.com/news/topics/cj3ergr8209t',
        base: 'https://www.bbc.com/'
    },
    {
        name: 'cnn',
        address: 'https://edition.cnn.com/election/2024',
        base: 'https://edition.cnn.com'
    }

]

const articles = [] 

newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)

            $('a:contains("Harris")' && 'a:contains("Trump")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')

                articles.push({
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name
                })
            })
        })
})

app.get('/', (req, res) => {
    res.json('Welcome to my USA Election News API')
})

app.get('/news', (req, res) => {
    res.json(articles)
})

app.get('/news/:newspaperId', async (req, res) => {
    const newspaperId = req.params.newspaperId

    const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address
    const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base

    axios.get(newspaperAddress)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specifArticles = []

            $('a:contains("Harris")' && 'a:contains("Trump")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                specifArticles.push({
                    title,
                    url: newspaperBase + url,
                    source: newspaperId
                })
            })
            res.json(specifArticles)
        }).catch(err => console.log(err))
})

app.listen(PORT, () => console.log('server running on PORT ' + PORT))
