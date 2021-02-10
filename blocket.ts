import { ICarListing } from './CarListing'

const readline = require('readline')
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const { Webhook , MessageBuilder} = require('discord-webhook-node');
let emptArray = []
let urlLink, webhook, latestProductIds, latest;

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

    let data = await fetch("https://api.blocket.se/search_bff/v1/content?cg=1020&gb=2&st=s&include=all&gl=3&include=extend_with_shipping\n", {
        method: 'GET',
        headers: {'Authorization': `Bearer 7bb4e05a62b23d8da76a9fd5aedf2e733acd0d5e`}
    })

    let body = await data.json();

    let carInfo: ICarListing = {
        city: body.data[0],
        productLink: body.data[0],
        name: body.data[0],
        price: body.data[0],
        image: body.data[0],
        description: body.data[0],
        mileage: body.data[0],
        modelYear: body.data[0],
        horsePower: body.data[0],
        gearBox: body.data[0]
    }
    return carInfo
}

FetchingData()

// Tror deras api sparar alla listing som läggs ut i nåt iintervall, sen lägger ut alla de annonser från de intervallet samtidigt
//https://api.blocket.se/search_bff/v1/content?cg=1020&lim=40&me=30&mys=2009&pe=9&ps=4&r=23&st=s&include=all&gl=3&include=extend_with_shipping
// https://api.blocket.se/search_bff/v1/content?cg=1020&lim=40&st=s&include=all&gl=3&include=extend_with_shipping ALL

async function storeData(){
    const products = await FetchingData();

   const productIds = products.map(product => product.ad_id)

    if (!isEqualArrays(productIds, latest)) {
        const newProducts = products.filter(item => !latestProductIds.includes (item.id)  )
        latestProductIds = productIds
        if (newProducts.length > 0){
            for (let prod of newProducts){
                sendWebhook(prod)
            }
        }

    }
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


setInterval(() => storeData(), 1000)

async function sendWebhook(obj){

    webhook = await userInputWebhook();

    try {
        const embed = new MessageBuilder()
            .setTitle(`${obj.name}`)
            .setURL(`${obj.productLink}`)
            .addField('Beskrivning', `${obj.description}`)
            .addField('Pris', `${obj.price} Kr`, true)
            .addField('Miltal', `${obj.mileage} Mil`, true)
            .addField('Modelår', `${obj.modelYear}`, true)
            .addField('Hästkrafter', `${obj.horsePower} hK`, true)
            .addField('Växellåda', `${obj.gearBox}`, true)
            .addField('Stad', `${obj.city}`, true)
            .setColor('#00b0f4')
            .setImage(`${obj.image}`)
            .setTimestamp();
        webhook.send(embed);
    } catch (e) {
        console.log("error is " , e)
    }
}

/*
    @TODO
  DONE  Do while loop while array.length is equal to or less than two
  DONE  Do = Push object into Array.
                 if array.length is equal to 2
                              {then compare Object content is equal to eachother,
                                                     }
                                                     if(true) //becasue their same object            { pop array last element }
                 else
                   continue;

 */






