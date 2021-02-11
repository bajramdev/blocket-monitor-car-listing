
const readline = require('readline')
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const { Webhook , MessageBuilder} = require('discord-webhook-node');

const hook = new Webhook("https://discord.com/api/webhooks/809345164220956673/gLE6_KktB3vRwGlaWb7eHPWg6f6DAmch23cILzaXCrWw-Q250AVTUURMb2aHm05lq7Ue");

let emptArray = []
let urlLink, webhook;
let latestProductIds = []
let arr2 = []
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

    let data = await fetch("https://api.blocket.se/search_bff/v1/content?cg=1020&lim=40&r=23&st=s&include=all&gl=3&include=extend_with_shipping", {
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



        var products = await FetchingData();

        const productIds = products.map(product => product.ad_id)

//@TODO flag to check if script is executed first time



    if (!isEqualArrays(productIds, latestProductIds)) {
        const newProducts = products.filter(item => !latestProductIds.includes(item.id)  )
        latestProductIds = productIds

        if (newProducts.length > 0){

=======
            if (arr2[0] !== newProducts[0]) { //position has been changed

                const found = arr2.findIndex(element => newProducts[0] === element) //first index
                let changed = arr2.slice(0, found);

                for (let prod of changed){

                    console.log(typeof prod.ad_id)
                    // send webhook(prod)
                }
                arr2 = newProducts
            }


        }
    }
}

setInterval(storeData, 2000)

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

function sendWebhook(obj){


    try {
        const embed = new MessageBuilder()
            .setTitle(`${obj.subject}`)
            .setURL(`${obj.share_url}`)
            .addField('Beskrivning', `${obj.body}`)
            .addField('Pris', `${obj.price.value} Kr`, true)
            .addField('Miltal', `${obj.parameter_groups[0].parameters[2].value} Mil`, true)
            .addField('Modelår', `${obj.parameter_groups[0].parameters[3].value}`, true)
            .addField('Hästkrafter', `${obj.parameter_groups[1].parameters[1].value} hK`, true)
            .addField('Växellåda', `${obj.parameter_groups[0].parameters[1].value}`, true)
            .addField('Stad', `${obj.location[1].name}`, true)
            .setColor('#00b0f4')
            .setImage(`${obj.images[0].url}`)
            .setTimestamp();
        hook.send(embed);
    } catch (e) {
        console.log("error is " , e)
    }
}



storeData()



/**
 * city: body.data[0]?.location[1]?.name,
 productLink: body.data[0]?.share_url,
 name: body.data[0]?.subject,
 price: body.data[0]?.price?.value,
 image: body.data[0]?.images[0]?.url,
 description: body.data[0]?.body,
 mileage: body.data[0]?.parameter_groups[0]?.parameters[2]?.value,
 modelYear: body.data[0]?.parameter_groups[0]?.parameters[3]?.value,
 horsePower: body.data[0]?.parameter_groups[1]?.parameters[1]?.value,
 gearBox: body.data[0]?.parameter_groups[0]?.parameters[1]?.value
 }
*/