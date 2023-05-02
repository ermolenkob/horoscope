let currDate = new Date().toJSON().slice(0, 10);
let fs = require("fs");
let horoscopeReady = false;
let currentHoroscope;

function getHoroscopeStructure(currDate) {
  currentHoroscope = {
    date: currDate,
    aries: "",
    taurus: "",
    gemini: "",
    cancer: "",
    leo: "",
    virgo: "",
    libra: "",
    scorpio: "",
    ophiuchus: "",
    sagittarius: "",
    capricorn: "",
    aquarius: "",
    pisces: "",
  };
}

function readFile() {
  try {
    let fileCache = fs.readFileSync("cache.txt", {
      encoding: "utf8",
      flag: "r",
    });
    return fileCache.split(/(?={")/);
  } catch {
    let newFile = fs.createWriteStream("cache.txt");
    newFile.end();
  }
}

async function getNewHoroscopeAndWriteItInCache() {
  getHoroscopeStructure(currDate);
  for (signsName in currentHoroscope) {
    if (signsName === "date") continue;
    currentHoroscope[signsName] = await requestToChatGPT(signsName);
  }

  fs.writeFileSync("cache.txt", JSON.stringify(currentHoroscope), (err) => {
    console.error(err);
  });
  horoscopeReady = true;
}

async function requestToChatGPT(signsName) {
  const prompt = `Give me please a funny and ironic ${signsName} horoscope, no more than 50 words, with out introductions.`;
  const maxTokens = 50;
  const temperature = 0.5;
  const apiKey = "your-api-key-here"; // !!!
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
    });
}

function thereIsEmptySing() {
  let arrSings = [
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

function getCurrentHoroscope() {
  let arrCache = readFile();

  try {
    currentHoroscope = arrCache.map((x) => JSON.parse(x))[0];
  } catch {
    getNewHoroscopeAndWriteItInCache();
    return;
  }

  if (currentHoroscope.date != currDate || thereIsEmptySing()) {
    getNewHoroscopeAndWriteItInCache();
    return;
  }
  horoscopeReady = true;
}

const delay = async (ms) => {
  await new Promise((resolve) => {
    return setTimeout(resolve, ms);
  });
};

const checkHoroscopeWithDelay = async () => {
  if (horoscopeReady) return;
  let amountOfDecade = 0;
  while (amountOfDecade < 6) {
    await delay(3000);
    if (horoscopeReady) break;
    amountOfDecade++;
  }
};

getCurrentHoroscope();

checkHoroscopeWithDelay();
