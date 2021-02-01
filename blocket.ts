import { ICarListing } from './CarListing'

const { Webhook , MessageBuilder} = require('discord-webhook-node');
const hook = new Webhook("TOKEN");

const fetch = require('node-fetch');

let lastCarName = "";

async function FetchingData() {

  return await fetch('https://api.blocket.se/search_bff/v1/content?cg=1020&lim=40&st=s&include=all&gl=3&include=extend_with_shipping', {
        method: 'GET',
        headers: {'Authorization': 'Bearer 2b50870f85ec71b705a81fef8e56b7ca7df44d6c'}
    })
        .then(res => res.json())
        .then(json => {
            /**
             *
             *
             */
            const carInfo: ICarListing = {
                name: json.data[0]?.subject,
                price: json.data[0]?.price.value,
                image : json.data[0]?.images[0].url,
                description: json.data[0]?.body,
                milage: json.data[0]?.parameter_groups[0].parameters[2].value,
                modelYear: json.data[0]?.parameter_groups[0].parameters[3].value,
                horsePower: json.data[0]?.parameter_groups[1].parameters[1].value,
                gearBox: json.data[0]?.parameter_groups[0].parameters[1].value
            }
           return carInfo
        })
}

async function sendWebhook(){
    const lastCarName = await FetchingData();

    const embed = new MessageBuilder()
        .setTitle(`${lastCarName.name}`)
        .setURL('https://www.blocket.com')
        .addField('Pris', `${lastCarName.price}`, true)
        .addField('Miltal', `${lastCarName.milage}`)
        .addField('Modelår', `${lastCarName.modelYear}`)
        .addField('Hästkrafter', `${lastCarName.horsePower}`)
        .addField('Växellåda', `${lastCarName.gearBox}`)
        .setColor('#00b0f4')
        .setImage(`${lastCarName.image}`)
        .setDescription(`${lastCarName.description}`)
        .setFooter('Hey its a footer', 'https://cdn.discordapp.com/embed/avatars/0.png')
        .setTimestamp();

    hook.send(embed);


}

async function storeData(){

    const obj = await FetchingData();
    if (obj.name != lastCarName){
        lastCarName = obj.name;
        sendWebhook();
    }
}


setInterval(() => storeData(), 1000)

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






