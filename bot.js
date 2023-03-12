import tmi from 'tmi.js';
import { doSomethingWithProbability } from './utils.js'; // , saveData, loadData, getUserData
import fs from 'fs';
import process from 'process';

if (process.argv.length < 7) {
  console.error('Error: wrong aguments...');
  process.exit(1);
}

const BOT_TOKEN = process.argv[2];
const CLIENT_ID = process.argv[3];
const AUTHORIZATION = process.argv[4];
const ACCID = process.argv[5];
const JWT_TOKEN = process.argv[6];

const mcdev_tv = "mcdev_tv";
const pufffi = "official_pufffi";
const mcbeagletv = "mcbeagletv";

const opts =
{
    identity:
    {
      username: 'pufffibot',
      password: 'oauth:' + BOT_TOKEN
    },
    channels:
    [
        mcdev_tv,
    ]
};

const bot = new tmi.client(opts);

console.clear();

let startTime;

function formatDuration(duration) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / 1000 / 60) % 60);
  const hours = Math.floor((duration / 1000 / 60 / 60) % 24);
  const days = Math.floor(duration / 1000 / 60 / 60 / 24);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function handleBotUptimeCommand(channel) {
  const currentTime = Date.now();
  const uptime = formatDuration(currentTime - startTime);
  const message = `Der Bot ist seit ${uptime} online!`;
  bot.say(channel, message);
}

bot.on('message', (channel, tags, message, self) => {
  if (self) return;
  console.log(`${tags['display-name']}: ${message}`);
});

bot.on('connected', (address, port) => {
    bot.say('official_pufffi', 'Bot ist online!');
    console.log('Bot ist online!');
    startTime = Date.now();
  });

bot.connect();


const prefix = "!";
const users = new Set();

let lastStealCommandTime = 0;

bot.on('message', (channel, tags, message, self) => {
  if (self) return;
  
  users.add(tags.username);

if (message === prefix + 'checkbot')
    {
      if(tags.username === "official_pufffi" || tags.username === "mcdev_tv" || tags.mod)
      {
        bot.say(channel, 'Bot online.')
      }
    }
    else if (message === prefix + 'stopbot')
    {
      if(tags.username === "official_pufffi" || tags.username === "mcdev_tv" || tags.mod)
      {
        bot.say(channel, 'Bot disconnected.')
        bot.disconnect();
      }
    }
    else if (message === prefix + 'botuptime')
    {
      if(tags.username === "official_pufffi" || tags.username === "mcdev_tv" || tags.mod)
      {
        handleBotUptimeCommand(channel)
      }
    }
    // mcdevtParty 
    else if (message === prefix + 'party2')
    {
      if(tags.username === "official_pufffi" || tags.username === "mcdev_tv" || tags.mod)
      {
        bot.say(channel, 'mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty')
        bot.say(channel, 'mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty')
        bot.say(channel, 'mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty mcdevtParty')
      }
    }
    else if (message.startsWith(prefix + 'pbs '))
    {
      if(tags.username === "official_pufffi")
      {
        const args = message.slice(5);
        bot.say(channel, args);
      }
    }
    else if (message.startsWith(prefix + 'steal '))
    {
      let channelName = channel.substring(1);
      handleIsChannelLive(channelName).then((isLive) => {
        if(isLive)
        {
          const target = message.slice((prefix + 'steal ').length);
          const currentTime = Date.now();
          const timeSinceLastStealCommand = currentTime - lastStealCommandTime;
          if (timeSinceLastStealCommand < 15000) {
            const remainingTime = 15000 - timeSinceLastStealCommand;
            //const minutes = Math.floor(remainingTime / 60000);
            const seconds = Math.floor((remainingTime) / 1000);
            bot.say(channel, `Der Befehl kann erst in ${seconds} Sekunden wieder ausgeführt werden.`);
          } else {
            lastStealCommandTime = currentTime;
            handleStealCommand(tags, channel, target);
          }
        }
        else
        {
          bot.say(channel, "Channel isn't live.")
        }
      }).catch((error) => {
        console.error(error);
      });
    }
});



function getPoints(username) {
  const channelName = ACCID

  const options = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      Authorization: 'Bearer ' + JWT_TOKEN
     },
  };

  return fetch(`https://api.streamelements.com/kappa/v2/points/${channelName}/${username}`, options)
    .then(response => response.json())
    .then(data => data.points)
    .catch(error => console.error(error));
}

async function handlePointstestCommand(userstate, channel) {
  try {
    const username = userstate.username;
    let pointsFromRandomUser = await getPoints(username);
    bot.say(channel, `test: Points von ${username}: ${pointsFromRandomUser}`);
  } catch (error) {
    console.error(error);
  }
}



async function handleStealCommand(userstate, channel, target)
{
  const randomNumber = getRandomNumber(20, 150);
  const currentUser = userstate.username;
  let targetUser = target;
  if(targetUser.startsWith('@')) {
    targetUser = targetUser.slice(1);
  }
  
  const now = Math.floor(Date.now() / 1000);
  const data = loadData();

  const currentUserObj = getUserData(currentUser, data);
  const targetUserObj = getUserData(targetUser, data);

  const currentUserLastStealUse = currentUserObj.lastStealUse;
  const currentUserDiff = now - currentUserLastStealUse;
  const targetLastRobbed = targetUserObj.lastRobbed;
  const targetUserDiff = now - targetLastRobbed;

  const currentUserUsedStealCmd = currentUserObj.usedStealCmd;
  const targetUserGetRobbed = targetUserObj.getRobbed;

  if(currentUserDiff <= 5*60)
  {
    const timeToSteal = 5*60-currentUserDiff;
    const minutes = Math.floor(timeToSteal / 60);
    const seconds = timeToSteal % 60;
    bot.say(channel, "Du kannst erst in " + minutes + " Minute(n) und " + seconds + " Sekunde(n) wieder klauen.")
    return;
  }
  if(targetUserDiff <= 15*60)
  {
    const timeToRob = 15*60-targetUserDiff;
    const minutes = Math.floor(timeToRob / 60);
    const seconds = timeToRob % 60;
    bot.say(channel, targetUser + " kann erst in " + minutes + " Minute(n) und " + seconds + " Sekunde(n) wieder beklaut werden.")
    return;
  }

  currentUserObj.lastStealUse = now;
  targetUserObj.lastRobbed = now;
  currentUserObj.usedStealCmd = currentUserUsedStealCmd + 1;
  targetUserObj.getRobbed = targetUserGetRobbed + 1;

  saveData(data);

  let pointsFromTargetUser = await getPoints(targetUser);

  if(doSomethingWithProbability(0.7))
  {
    if (pointsFromTargetUser == 0 || pointsFromTargetUser === undefined) {
      bot.say(channel, `${targetUser} hat keine Nuggets, die geklaut werden können.`);
      return;
    }
    if (randomNumber >= pointsFromTargetUser)
    {
      bot.say(channel, `${currentUser} hat ${pointsFromTargetUser} Nuggets von ${targetUser} geklaut.`);
      addPoints(currentUser, pointsFromTargetUser)
      removePoints(targetUser, pointsFromTargetUser)
    }
    else
    {
      bot.say(channel, `${currentUser} hat ${randomNumber} Nuggets von ${targetUser} geklaut.`);
      addPoints(currentUser, randomNumber)
      removePoints(targetUser, randomNumber)
    }
  }
  else
  {
    let pointsFromCurrentUser = await getPoints(currentUser);
    if (pointsFromCurrentUser == 0 || pointsFromCurrentUser === undefined) {
      bot.say(channel, `${currentUser} ist gescheitert und hat an ${targetUser} ${pointsFromCurrentUser} Nuggets verloren.`)
      addPoints(targetUser, pointsFromCurrentUser)
      removePoints(currentUser, pointsFromCurrentUser)
      return;
    }
    if (randomNumber >= pointsFromCurrentUser)
    {
      bot.say(channel, `${currentUser} ist gescheitert und hat an ${targetUser} ${pointsFromCurrentUser} Nuggets verloren.`)
      addPoints(targetUser, pointsFromTargetUser)
      removePoints(currentUser, pointsFromTargetUser)
    }
    else
    {
      bot.say(channel, `${currentUser} ist gescheitert und hat an ${targetUser} ${randomNumber} Nuggets verloren.`)
      addPoints(targetUser, randomNumber)
      removePoints(currentUser, randomNumber)
    }
  }
}



async function addPoints(username, amount)
{
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + JWT_TOKEN
    },
    body: '{"users":[{"username":"' + username + '","current":' + amount + '}],"mode":"add"}'
  };
  
  try {
    const response = await fetch('https://api.streamelements.com/kappa/v2/points/' + ACCID, options);
    const text = await response.text();
    console.log(text);
  } catch (err) {
    console.error(err);
  }
}

async function removePoints(username, amount)
{
  const currentPoints = await getPoints(username);
  let pointsToSet = 0;
  if(currentPoints <= amount)
  {
    pointsToSet = 1
  }
  else
  {
    pointsToSet = currentPoints - amount
  }
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + JWT_TOKEN
    },
    body: '{"users":[{"username":"' + username + '","current":' + pointsToSet + '}],"mode":"set"}'
  };
  
  try {
    const response = await fetch('https://api.streamelements.com/kappa/v2/points/' + ACCID, options);
    const text = await response.text();
    console.log(text);
  } catch (err) {
    console.error(err);
  }
}


function getRandomNumber(min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const dataFilePath = 'data.json';

function loadData() {
  try {
    const data = JSON.parse(fs.readFileSync(dataFilePath));
    return data;
  } catch (err) {
    console.error(`Error while reading data file: ${err}`);
    return {};
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data));
  } catch (err) {
    console.error(`Error while writing data file: ${err}`);
  }
}

function getUserData(username, data) {
  if (!data[username]) {
    data[username] = {
      lastStealUse: 0,
      usedStealCmd: 0,
      lastRobbed: 0,
      getRobbed: 0,
    };
  }
  return data[username];
}

async function isChannelLive(channelName) {
  const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${channelName}`, {
    headers: {
      'Client-ID': CLIENT_ID,
      'Authorization': 'Bearer ' + AUTHORIZATION
    }
  });
  const data = await response.json();
  return data.data.length > 0;
}

async function handleIsChannelLive(channel) {
  try {
    let isLive = await isChannelLive(channel);
    //console.log("isChannelLive: " + isLive);
    return isLive;
  } catch (error) {
    console.error(error);
  }
}
