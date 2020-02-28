const path = require('path');
const express = require('express');
const {setLogLevel, logExpression} = require('@cisl/zepto-logger');
const {postToService} = require('./utils');
const packageJson = require('./package.json');

let myPort = 14008;
let logLevel = 1;
process.argv.forEach((val, index, array) => {
  if (val === '-port') {
    myPort = parseInt(array[index + 1]);
  }
  if (val === '-level') {
    logLevel = array[index + 1];
    logExpression('Setting log level to ' + logLevel, 1);
  }
});
setLogLevel(logLevel);

const ingredient_list = [
  'egg',
  'flour',
  'milk',
  'sugar',
  'chocolate',
  'vanilla',
  'blueberry'
];

let currentUtility = null;
let currentName = null;
let currentRound = null;
let currentBid = null;
let roundActive = false;
let roundStart = 0;
let roundDuration = 0;

const ingredientPattern = new RegExp(`(\\d+ (?:${ingredient_list.join('|')})s?)`, 'g');
const pricePattern = new RegExp(/(?:\${1}([\d\.]+)|([\d\.]+) USD)/);

const app = express();
app.set('port', myPort);
app.set('json spaces', 2);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.json({
    agent: 'kleene',
    version: packageJson.version
  });
});

app.post('/receiveMessage', (req, res) => {
  logExpression('inside /receiveMessage', 2);
  logExpression(req.body, 2);
  if (!roundActive) {
    return res.json({
      status: 'round_not_active',
    });
  }
  logExpression(`time in round remaining: ${roundDuration - ((Date.now() - roundStart) / 1000)}`, 1);

  if (req.body.addressee.toLowerCase() !== currentName.toLowerCase()) {
    return res.json({
      status: 'not_my_name'
    });
  }

  const acceptPhrases = [`${currentName} I accept`.toLowerCase(), `${currentName} I agree`.toLowerCase()].includes(req.body.text.toLowerCase());
  if (currentBid && acceptPhrases) {
    const payload = {
      text: "You got it! Enjoy your purchase!",
      speaker: currentName,
      role: 'seller',
      addressee: 'Human',
      timeStamp: new Date(),
      bid: currentBid
    };
    payload.bid.type = 'Accept';

    postToService('environment-orchestrator', '/relayMessage', payload);

    return res.json({status: 'acknowledged'});
  }

  const current = {};
  logExpression(`Matching items with: ${ingredientPattern}`);
  const items = req.body.text.match(ingredientPattern);
  if (items) {
    for (let item of items) {
      item = item.split(/[ ]+/);
      if (item[1].substr(-1) === 's') {
        item[1] = item[1].substring(0, item[1].length - 1);
      }
      current[item[1]] = parseInt(item[0]);
    }
  }

  logExpression('Parsed items from input:', 2);
  logExpression(current, 2);

  logExpression(`Matching price with: ${pricePattern}`);
  const bidReg = req.body.text.match(pricePattern);
  let bidPrice;
  if (bidReg) {
    bidPrice = parseFloat((bidReg[1] === null) ? bidReg[2] : bidReg[1])
  }
  else {
    bidPrice = Math.floor(Math.random() * 10);
  }

  logExpression(`Parsed bid price: ${bidPrice}`, 2);

  if (Math.random() > 0.4) {
    bidPrice += Math.random() * 4;
  }

  logExpression(`Adjusted bid price: ${bidPrice}`, 2);

  bidPrice = parseFloat(bidPrice.toFixed(2));

  logExpression(`Rounded bid price: ${bidPrice}`, 2);

  currentBid = {
    quantity: current,
    price: {
      value: bidPrice,
      unit: 'USD'
    }
  };

  logExpression('Current bid:', 2);
  logExpression(currentBid);

  const payload = {
    text: `How about I sell you ${Object.keys(currentBid.quantity).map((k) => `${currentBid.quantity[k]} ${k}`).join(', ')} for ${currentBid.price.value.toFixed(2)} ${currentBid.price.unit}?`,
    speaker: currentName,
    role: 'seller',
    addressee: 'Human',
    timeStamp: new Date(),
    bid: currentBid
  };
  payload.bid.type = 'SellOffer';

  postToService('environment-orchestrator', '/relayMessage', payload);

  return res.json({status: 'acknowledged'});
});

app.post('/receiveRejection', (req, res) => {
  logExpression('inside /receiveRejection', 2);
  logExpression(req.body, 2);
  res.json({status: 'acknowledged'});
});

app.post('/setUtility', (req, res) => {
  logExpression('inside /setUtility', 2);
  logExpression(req.body, 2);
  currentName = req.body.name;
  currentUtility = req.body;
  delete currentUtility.name;
  res.json({status: 'acknowledged'});
});

app.post('/startRound', (req, res) => {
  logExpression('inside /startRound', 2);
  logExpression(req.body, 2);
  currentRound = req.body.roundNumber;
  roundDuration = parseFloat(req.body.roundDuration);
  roundStart = Date.now();
  roundActive = true;

  logExpression(`Round ${currentRound} started`, 1);
  res.json({status: 'acknowledged'});
});

app.post('/endRound', (req, res) => {
  logExpression('inside /endRound', 2);
  logExpression(req.body, 2);
  roundActive = false;

  logExpression(`Round ${currentRound} ended`, 1);
  res.json({status: 'acknowledged'});
});

app.listen(app.get('port'), () => {
  logExpression(`Express server listening on ${app.get('port')}`, 1);
});
