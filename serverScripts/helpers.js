module.exports = {}

function formatDate(date, format) {
  if (!date) return "";
  /* date = new Date(date) */
  let result = window.dayjs(date).format(format || "DD.MM.YYYY");
  if (result == "Invalid Date") {
    // console.log('format date, returned', date)
    return date;
  }
  // console.log('formatDate', date, result);
  return result;
}
module.exports.formatDate = formatDate

function parseDate(string, format) {
  // let dayjsFormat = window.dayjs(string, "DD.MM.YYYY").format("DD.MM.YYYY");
  // console.log('parseDate', string, dayjsFormat);
  let result = window.dayjs(string, format || "DD.MM.YYYY").toDate();
  if (result == "Invalid Date") {
    result = window.dayjs(string, "YYYY-MM-DD").toDate();
    if (result == "Invalid Date") {
      // console.log('parse date, returned', string)
      return string;
    }
  }
  // console.log('parseDate result', result);
  return result; // почему-то парсится в дату чуть раньше
}
module.exports.parseDate = parseDate

function parseTime(string, format) {
  let result = window.dayjs(string, format || "DD.MM.YYYY HH:mm").toDate();
  // console.log('parseTime', string, format, result);

  return result; // почему-то парсится в дату чуть раньше
}
module.exports.parseTime = parseTime

function formatTime(date, format) {
  if (!date) return "";
  let result = window.dayjs(date).format(format || "DD.MM.YYYY HH:mm");
  // console.log("formatTime", date, format, result);

  return result;
}
module.exports.formatTime = formatTime

function randomInt(min = 0, max = 100000) {
  // случайное число от min до (max+1)
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}
module.exports.randomInt = randomInt

function randomIntString(count = 20) {
  let res = "";
  for (let i = 0; i < count; i++) {
    res += randomInt(0, 9);
  }
  return res;
}
module.exports.randomIntString = randomIntString

