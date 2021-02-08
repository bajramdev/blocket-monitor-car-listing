var clc = require("cli-color");

const readline = require('readline')
let cheerio = require('cheerio');
const fetch = require('node-fetch');

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
    console.log(clc.magentaBright("Successfully submitted Webhook!"));
    process.stdout.write(clc.erase.screen);
    process.stdout.write(clc.reset);

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

    console.log(body)
}

//Execution
async function Execution() {
    await DiscordWebhook();
    await FetchingURL();
}

Execution();