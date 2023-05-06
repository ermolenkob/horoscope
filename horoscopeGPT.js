const fs = require("fs");
const events = require("events");
const myEmitter = new events.EventEmitter();
const currDate = new Date().toJSON().slice(0, 10);
const arrSings = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "ophiuchus",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];
let horoscopeReady = false;
let currentHoroscope;

function getCurrentHoroscope() {
  try {
    // getting data from a file cache.txt
    currentHoroscope = fs
      .readFileSync("cache.txt", {
        encoding: "utf8",
        flag: "r",
      })
      .split(/(?={")/)
      .map((line) => JSON.parse(line))[0];
  } catch {
    // if the data in the file is incorrect, then make a new request to chatGPT
    getNewHoroscopeAndWriteItInCache();
    return;
  }

  // check that the horoscope is for the current date and whether all the data is filled out
  if (currentHoroscope.date != currDate || thereIsEmptySing()) {
    // if the date is not correct or the data is not filled out - a new request to chatGPT
    getNewHoroscopeAndWriteItInCache();
    return;
  }
  // the horoscope from the file is correct. no new request to chatGPT
  horoscopeReady = true;
}

function thereIsEmptySing() {
  for (let sing of arrSings) {
    if (
      currentHoroscope[sing] === "" ||
      typeof currentHoroscope[sing] != "string"
    ) {
      return true;
    }
  }
  return false;
}

async function getNewHoroscopeAndWriteItInCache() {
  const arrPromises = [];

  // get the current horoscope for each sign
  for (let signsName of arrSings) arrPromises.push(requestToChatGPT(signsName));

  await Promise.all(arrPromises);

  // fill in the structure of the object currentHoroscope
  currentHoroscope = await arrSings.reduce(
    (target, key, index) => {
      arrPromises[index]
        .then((data) => {
          target[key] = data.choices[0].text;
        })
        .catch((err) => console.error(`Error #2: ${err}`));
      return target;
    },
    { date: currDate }
  );

  // write new data to file cache.txt
  fs.writeFileSync("cache.txt", JSON.stringify(currentHoroscope), (err) => {
    console.error(err);
  });

  // announce that the horoscope is ready
  myEmitter.emit("horoscopeIsReady", "new ");
}

function requestToChatGPT(signsName) {
  // !!! be sure to substitute your current key !!!
  const apiKey = "your-api-key-here";
  const engineId = "davinci";
  const maxTokens = 50;
  const temperature = 0.5;
  const prompt = `Give me a funny ironic ${signsName} horoscope without a hello`;

  return fetch(`https://api.openai.com/v1/engines/${engineId}/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      max_tokens: maxTokens,
      temperature: temperature,
    }),
  })
    .catch((err) => console.error(`Error #1: ${err}`))
    .then((response) => response.json());
}

// the function "sendHoroscope" will report the readiness of a new or the receipt of an existing horoscope
const sendHoroscope = (nuance = "") =>
  console.log(`The most honest ${nuance}horoscope is ready`);

// initialize the event if there is a request to chatGPT
myEmitter.on("horoscopeIsReady", sendHoroscope);

// getting a horoscope
getCurrentHoroscope();

// check if horoscope is received synchronously
if (horoscopeReady) sendHoroscope();
