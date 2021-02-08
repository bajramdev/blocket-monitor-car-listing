import { ICarListing } from './CarListing'

const readline = require('readline')
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const { Webhook , MessageBuilder} = require('discord-webhook-node');
const hook = new Webhook("https://discord.com/api/webhooks/789257095131168768/aMzHH8sKOfmMuZ4dTOoTZo0w-D_6s3g7LRNeoLomHaaG9QnTcigwHzuKEACiIF2f6xHW");
let listingURL = ""
let emptArray = []
let urlLink, webhook

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
async function DiscordWebhook(){
    webhook = await userInputWebhook()

    return webhook;
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

    let token = $('#__NEXT_DATA__').html().match(regex)[0]


    let url = urlLink.split("bilar?")[1]

    let api = `https://api.blocket.se/search_bff/v1/content?${url}&st=s&include=all&gl=3&include=extend_with_shipping`

    console.log("inside fun" , api)
    console.log("inside fun" , token)

    return  {api , token}

}

//Scrapeing webstie
async function FetchingURL() {


    let {api, token} = await scrapeURL()

    console.log(typeof api)
    let something = await fetch(api, {
        method: 'GET',
        headers: {'Authorization': `Bearer ${token}`}
    })

    let body = await something.json();

    let carInfo: ICarListing = {
        city: body.data[0]?.location[1]?.name,
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

    return carInfo
}

//Execution
async function Execution() {
    await DiscordWebhook();
    await FetchingURL();
}

Execution();

// Tror deras api sparar alla listing som läggs ut i nåt iintervall, sen lägger ut alla de annonser från de intervallet samtidigt
//https://api.blocket.se/search_bff/v1/content?cg=1020&lim=40&me=30&mys=2009&pe=9&ps=4&r=23&st=s&include=all&gl=3&include=extend_with_shipping
// https://api.blocket.se/search_bff/v1/content?cg=1020&lim=40&st=s&include=all&gl=3&include=extend_with_shipping ALL


async function storeData(){
    const obj = await FetchingData();

    emptArray.push(obj)
    if (emptArray.length === 1){
        sendWebhook(obj);
    } else if (emptArray.length >= 2) {
        let i = emptArray.length - 1;

        if (emptArray[i].name !== emptArray[i-1].name){  // not the same listing
            sendWebhook(emptArray[i])
        }
    }
}

setInterval(() => storeData(), 1000)

function sendWebhook(obj){
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
        hook.send(embed);
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






