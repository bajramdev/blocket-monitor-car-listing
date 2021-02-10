
const readline = require('readline')
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const { Webhook , MessageBuilder} = require('discord-webhook-node');
let emptArray = []
let urlLink, webhook;
let latestProductIds = []
let loaded = false;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

//Reads userinput for webhook


const userInputWebhook = () => {
    return new Promise((resolve, reject) => {
        rl.question('Insert your Discord webhook: ', (answer) => {

            resolve(answer)

        })
    })
}

//User input for Listing

const userInputListingURL = () => {
    return new Promise((resolve, reject) => {
        rl.question('Insert the listing URL: ', (answer) => {
            resolve(answer)
        })
    })
}

//Scrape the Listing URL

async function scrapeURL(){


    urlLink = await userInputListingURL()

    rl.close()

    //Fetch BearerToken

    const response = await fetch(urlLink)

    const html = await response.text();

    const $ = cheerio.load(html)

    let regex = /([a-z0-9]{40})/

    // token
    let token = $('#__NEXT_DATA__').html().match(regex)[0]


    let url = urlLink.split("bilar?")[1]

    let api = `https://api.blocket.se/search_bff/v1/content?${url}&st=s&include=all&gl=3&include=extend_with_shipping`

    return  {api , token}

}

//Scrapeing webstie
async function FetchingData() {

    // let {api, token} = await scrapeURL()

    let data = await fetch("https://api.blocket.se/search_bff/v1/content?cg=1020&lim=40&st=s&include=all&gl=3&include=extend_with_shipping", {
        method: 'GET',
        headers: {'Authorization': `Bearer 09e1ce5f10adb0311e6ee91d9cc00c0bb982158d`}
    })

    let body = await data.json();

    return body.data;
}


// Tror deras api sparar alla listing som läggs ut i nåt iintervall, sen lägger ut alla de annonser från de intervallet samtidigt
//https://api.blocket.se/search_bff/v1/content?cg=1020&lim=40&me=30&mys=2009&pe=9&ps=4&r=23&st=s&include=all&gl=3&include=extend_with_shipping
// https://api.blocket.se/search_bff/v1/content?cg=1020&lim=40&st=s&include=all&gl=3&include=extend_with_shipping ALL

async function storeData(){
    do {


        var products = await FetchingData();

        const productIds = products.map(product => product.ad_id)

//@TODO flag to check if script is executed first time



    if (!isEqualArrays(productIds, latestProductIds)) {
        const newProducts = products.filter(item => !latestProductIds.includes(item.id)  )
        latestProductIds = productIds

        if (newProducts.length > 0){

            for (let prod of newProducts){

                console.log(prod.ad_id)
                // send webhook(prod)
            }
        }
    }    } while (products.length - 1 !== products.length )
}

function isEqualArrays(array1, array2){

    if (array1.length !== array2.length){
        return false
    }

    for (let el of array1){

        let Isfound = false
        for (let el2 of array2){
            if (el === el2){
                Isfound = true;
            }

        }
        if(Isfound===false){
            return false
        }

    }
    return true
}


storeData()



