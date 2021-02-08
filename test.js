let cheerio = require('cheerio');


const fetch = require('node-fetch');


async function a() {
    let body = await fetch("https://api.blocket.se/search_bff/v1/content?cg=1020&r=23&st=s&include=all&gl=3&include=extend_with_shipping", {
        method: 'GET',
        headers: {'Authorization': `Bearer e56eba1e49751e826738c9a06441a60e0a218d4e`}
    })

    let asd = await body.json()


    console.log(asd.data[0].share_url)
}

a()