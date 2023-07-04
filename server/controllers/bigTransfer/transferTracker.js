const WebSocket = require("ws");
const http = require("http");
const socketIO = require("socket.io");
const https = require("https");
const CronJob = require("cron").CronJob;
let io;
let lastMessageTime = 0;
const maxValues = 50;
let last50Values = [];
let selectedVolume = 1;
let btcPrice;
startCronJobs();

async function connectToBinanceWS() {
  const coins100 = await get100CoinsByPrice();
  const ws = new WebSocket("wss://stream.binance.com:9443/ws");

  ws.on("open", () => {
    ws.send(
      JSON.stringify({
        method: "SUBSCRIBE",
        params: coins100.map((coin) => coin.name),
        id: 1,
      })
    );
  });

  ws.on("message", (data) => {
    const now = Date.now();
    const msg = JSON.parse(data);
    coins100.forEach((coin, index) => {
      if (
        msg.s === coin.symbol &&
        msg.e === "aggTrade" &&
        msg.q > coin.qEqBTC &&
        now - lastMessageTime < 50
      ) {
        const test = (msg.p * msg.q) / (btcPrice * selectedVolume);
        console.log(msg.s, "bitcoin equivalent quantity", test, "coin price => ", msg.p);
        last50Values.push(msg);
        if (last50Values.length > maxValues) {
          last50Values.shift();
        }
        console.log(msg.s, coin.symbol);
        console.log(msg.q, "qEQBTC", coin.qEqBTC);
        sendToClient(last50Values);

        if (msg.m) {
          console.log(msg.m, "BUY");
        } else {
          console.log("SELL");
        }
      }
    });

    lastMessageTime = now;
  });

  return sendToClient;
}

function createWebSocketServer(port) {
  const server = http.createServer();
  const corsWhitelist = ["http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:8080"];

  io = socketIO(server, {
    cors: {
      origin: corsWhitelist,
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected to transfer tracker!");
    if (last50Values.length > 0) {
      io.emit("message", JSON.stringify(last50Values));
    }
  });

  server.listen(port, () => {
    console.log(`WebSocket server is listening on port ${port}`);
  });
}

function sendToClient(data) {
  io.emit("message", JSON.stringify(data));
}

async function getBtcPrice() {
  try {
    return new Promise((resolve, reject) => {
      https
        .get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT", (response) => {
          let btcPrice = "";

          response.on("data", (chunk) => {
            btcPrice += chunk;
          });

          response.on("end", () => {
            resolve(JSON.parse(btcPrice).price);
          });
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function get100CoinsByPrice(volumeInBitcoinEq = 1) {
  selectedVolume = volumeInBitcoinEq;
  btcPrice = await getBtcPrice();
  try {
    return new Promise((resolve, reject) => {
      https
        .get("https://api.binance.com/api/v3/ticker/price", (resp) => {
          let data = "";

          resp.on("data", (chunk) => {
            data += chunk;
          });

          resp.on("end", () => {
            const results = JSON.parse(data);
            const usdtPairs = results.filter((pair) => pair.symbol.endsWith("USDT"));

            const sortedPairs = usdtPairs.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            console.log(sortedPairs.slice(0, 250));

            const pairs = sortedPairs.slice(0, 250).map((result) => ({
              symbol: result.symbol,
              name: result.symbol.toLowerCase() + "@aggTrade",
              price: result.price,
              qEqBTC: (btcPrice * selectedVolume) / result.price,
            }));

            // console.log("Top 100 pairs by market capitalization with USDT:", pairs.slice(0, 100));
            // console.log("Top 50 pairs by market capitalization with USDT:", pairs.slice(100, 50));
            resolve(pairs);
          });
        })

        .on("error", (err) => {
          console.log("Error: " + err.message);
        });
    });
  } catch (error) {
    console.error(error);
  }
}

function startCronJobs() {
  const job = new CronJob("0 */2 * * * ", () => {
    console.log("connect to binance websocket =>", new Date().toLocaleTimeString());
    connectToBinanceWS();
  });

  const jobGetCurrentPriceBTC = new CronJob(" */1 * * * *", async() => {
    console.log("get bitcoin price =>", new Date().toLocaleTimeString());
    btcPrice = await getBtcPrice();
  });

  jobGetCurrentPriceBTC.start();
  job.start();
}
module.exports = {
  connectToBinanceWS,
  createWebSocketServer,
};
