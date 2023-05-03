let currDate = new Date().toJSON().slice(0, 10);
let fs = require("fs");
const events = require("events");
const myEmitter = new events.EventEmitter();
let horoscopeReady = false;
let currentHoroscope;

function getCurrentHoroscope() {
  // getting data from a file cache.txt
  let arrCache = readFile();

  try {
    // check if you can get the desired data from the file
    currentHoroscope = arrCache.map((x) => JSON.parse(x))[0];
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

function readFile() {
  try {
    let fileCache = fs.readFileSync("cache.txt", {
      encoding: "utf8",
      flag: "r",
    });
    return fileCache.split(/(?={")/);
  } catch {
    // if the file is not found, create a new file
    let newFile = fs.createWriteStream("cache.txt");
    newFile.end();
  }
}

function thereIsEmptySing() {
  // get a list of zodiac signs to check
  const arrSings = getArrayOfSings();

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

function getArrayOfSings() {
  return [
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
}

async function getNewHoroscopeAndWriteItInCache() {
  // fill in the structure of the object currentHoroscope
  getHoroscopeStructure(currDate);

  for (signsName in currentHoroscope) {
    if (signsName === "date") continue;

    // get the current horoscope for each sign
    currentHoroscope[signsName] = await requestToChatGPT(signsName);
  }

  // write new data to file cache.txt
  fs.writeFileSync("cache.txt", JSON.stringify(currentHoroscope), (err) => {
    console.error(err);
  });

  // announce that the horoscope is ready
  myEmitter.emit("horoscopeIsReady", "new ");
}

function getHoroscopeStructure(currDate) {
  currentHoroscope = { date: currDate };

  // get a list of zodiac signs to check
  const arrSings = getArrayOfSings();

  // prepare an empty object structure
  for (let sing of arrSings) {
    currentHoroscope[sing] = "";
  }
}

async function requestToChatGPT(signsName) {
  const prompt = `Give me please a funny and ironic ${signsName} horoscope, no more than 50 words, with out introductions.`;
  const maxTokens = 50;
  const temperature = 0.5;
  // !!! be sure to substitute your current key !!!
  const apiKey = "your-api-key-here";
  const engineId = "davinci";

  return await fetch(
    `https://api.openai.com/v1/engines/${engineId}/completions`,
    {
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
    }
  )
    .then((response) => response.json())
    .then((data) => {
      return data.choices[0].text;
    })
    .catch((err) => console.error(err));
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
