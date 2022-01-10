global.__rootDir = __dirname;

const _ = require("lodash");
const { parse } = require("url");
const finalhandler = require("finalhandler");
const { createServer } = require("http");
const serveStatic = require("serve-static");
const dayjs = require("dayjs");
require("dayjs/locale/ru");
const weekday = require("dayjs/plugin/weekday");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
dayjs.locale("ru");
dayjs.extend(weekday);

const handlePostRequests = require("./serverScripts/requests/post");

// Serve up public folder
var staticServe = serveStatic(".", { index: ["index.html"] });
// Create server
var server = createServer(async function onRequest(req, res) {
  
  const parsedUrl = parse(req.url, true);
  let filePath = '';

  let urlPath = parsedUrl.pathname;

  urlPath = urlPath.toLowerCase();

  if (req.method.toUpperCase() == "POST") {
    await handlePostRequests(req, res, parsedUrl);
    return;
  }

  if (urlPath.startsWith("")) {
    filePath = `reports/${urlPath}`
    staticServe(req, res, finalhandler(req, res))
    
  }
  
  if (urlPath.startsWith(`/reports/${filePath}`)) {
    staticServe(req, res, finalhandler(req, res));
    return;
  }


  if (["/robots.txt", "/sitemap.xml"].includes(urlPath)) {
    staticServe(req, res, finalhandler(req, res));
    return;
  }
  if (urlPath.startsWith("/assets/")) {
    staticServe(req, res, finalhandler(req, res));
    return;
  }
  if (urlPath.startsWith("/uploads/")) {
    staticServe(req, res, finalhandler(req, res));
    return;
  }

  // get page
  // await handlePageRequests(req, res, parsedUrl);
});


// Listen
server.listen(3000, function(){
  console.log("Server started at 3000");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", reason);
  // console.log('pages passed', global.pagesPassed);
  // console.log('wrongShots', global.wrongShots)

  // process.exit()
  // Application specific logging, throwing an error, or other logic here
});

process.on("uncaughtException", (err) => {
  console.error("Caught exception: ", err, err.message);
  // console.log('pages passed', global.pagesPassed);

  // process.exit()
});
