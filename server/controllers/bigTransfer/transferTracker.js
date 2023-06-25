const WebSocket = require("ws");
const router = require("../newsData/newsData");
const https = require("https");

let lastMessageTime = 0;
router.get("/", async (req, res) => {
  // 2. set coins from step 1 to params.Calculate the quantity equal to btc
  const WebSocket = require("ws");
  const binance = require("binance-api-node").default;

  const client = binance();
  const ws = new WebSocket("wss://stream.binance.com:9443/ws");

  ws.on("open", () => {
    ws.send(
      JSON.stringify({
        method: "SUBSCRIBE",
        params: ["btcusdt@aggTrade", "ethusdt@aggTrade"],
        id: 1,
      })
    );
  });

  ws.on("message", (data) => {
    const now = Date.now();
    const msg = JSON.parse(data);
    if (msg.e === "aggTrade" && msg.q > 1 && now - lastMessageTime < 50) {
      // console.log("large trade!", msg);
      // Process large trade
    }
    lastMessageTime = now;
  });

  // client.websockets.trades(["BTCUSDT"], (trade) => {
  //   // Trade update from REST API
  //   console.log('=>>>>>', trade);
  // });

  //1. Step one take first 100 coins
  try {
    const options = {
      hostname: 'pro-api.coinmarketcap.com',
      path: '/v1/cryptocurrency/listings/latest',
      port: 443, 
      method: "GET",
      headers: {
        "X-CMC_PRO_API_KEY": "",
      },
    };

    const requ = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        console.log(`Body: ${chunk}`);
      });
      res.on("end", () => {
        console.log("No more data in response.");
      });
    });

    requ.end();
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;

// Test from cryptowat
// console.log('yes')
// const API_KEY = "";

// const conn = new WebSocket("wss://stream.cryptowat.ch/connect?apikey=" + API_KEY);

// conn.on("message", function (msg) {
//   const d = JSON.parse(msg.toString());

//   // The server will always send an AUTHENTICATED signal when you establish a valid connection
//   // At this point you can subscribe to resources
//   if (d.authenticationResult && d.authenticationResult.status === "AUTHENTICATED") {
//     console.log("Streaming trades for 1 second...");
//     subscribe(conn, ["markets:*:trades"]);

//     setTimeout(function () {
//       console.log("Unsubscribing...");
//       unsubscribe(conn, ["markets:*:trades"]);
//     }, 1000);
//   }

//   // Market data comes in a marketUpdate
//   // In this case, we're expecting trades so we look for marketUpdate.tradesUpdate
//   if (d.marketUpdate && d.marketUpdate.tradesUpdate) {
//     for (let trade of d.marketUpdate.tradesUpdate.trades) {
//       console.log(
//         `BTC/USD trade on market ${d.marketUpdate.market.marketId}: ${trade.timestampNano} ${trade.priceStr} ${trade.amountStr}`
//       );

//     }
//   }
// });

// // Helper method for subscribing to resources
// function subscribe(conn, resources) {
//   conn.send(
//     JSON.stringify({
//       subscribe: {
//         subscriptions: resources.map((resource) => {
//           return { streamSubscription: { resource: resource } };
//         }),
//       },
//     })
//   );
// }

// function unsubscribe(conn, resources) {
//   conn.send(
//     JSON.stringify({
//       unsubscribe: {
//         subscriptions: resources.map((resource) => {
//           return { streamSubscription: { resource: resource } };
//         }),
//       },
//     })
//   );
// }
