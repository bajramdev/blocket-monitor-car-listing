
const readline = require('readline')
let cheerio = require('cheerio');
const fetch = require('node-fetch');

let urlLink, webhook

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const userInputWebhook = () => {
    return new Promise((resolve, reject) => {
        rl.question('Insert your Discord webhook: ', (answer) => {

            resolve(answer)

        })
    })
}

const userInputListingURL = () => {
    return new Promise((resolve, reject) => {
        rl.question('Insert the listing URL: ', (answer) => {
            resolve(answer)
        })
    })
}

const main = async () => {

    webhook = await userInputWebhook()

    urlLink = await userInputListingURL()

    rl.close()

    //Fetch BearerToken

    const response = await fetch(urlLink)

    const html = await response.text();

    const $ = cheerio.load(html)

    let regex = /([a-z0-9]{40})/

    let token = $('#__NEXT_DATA__').html().match(regex)[0]

    console.log(token)

    let url = urlLink.split("bilar?")[1]

    let api = `https://api.blocket.se/search_bff/v1/content?${url}&st=s&include=all&gl=3&include=extend_with_shipping`


    let something =  await fetch(api, {
        method: 'GET',
        headers: {'Authorization': `Bearer ${token}`}
    })

    let body = await something.json();


    try {

    let carInfo = {

        city: body.data[0].location[1].name,
        productLink: body.data[0].share_url,
        name: body.data[0].subject,
        price: body.data[0].price?.value,
        image: body.data[0].images[0]?.url,
        description: body.data[0].body,
        mileage: body.data[0].parameter_groups[0]?.parameters[2]?.value,
        modelYear: body.data[0].parameter_groups[0]?.parameters[3]?.value,
        horsePower: body.data[0].parameter_groups[1]?.parameters[1]?.value,
        gearBox: body.data[0].parameter_groups[0]?.parameters[1]?.value
    }
        console.log(carInfo)
    } catch (e) {
        console.log("error is " , e)
    }



}


main();

