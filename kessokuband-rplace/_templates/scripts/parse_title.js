function modulo(a, b) {
  // if b is 3, then {..., 3, 2, 1, 0, -1, -2, -3, ...} => {..., 0, 2, 1, 0, 2, 1, 0, ...}
  let A = Math.floor(a);
  return a - b*Math.floor(A/b);
}

function parse_title(title) {
  var dateArray = [2023, 7, 20];
  var timeArray = title.slice(0, 6).split("-").map(x => parseInt(x));
  var remainder = title.slice(6);
  // add correct amount of hours to time to make it utc+0
  timeArray[0] += (new Date()).getTimezoneOffset()/60; 
  // adjust date if needed
  if (timeArray[0] < 0 || timeArray[0] >= 24) {
    dateArray[2] += timeArray[0] < 0 ? -1 : 1;
    timeArray[0] = modulo(timeArray[0], 24);
    // won't have to worry about incrementing the month or year as it ended on the 25th
  }
  remainder = remainder == "" ? "" : " " + remainder;
  return dateArray.map(x => x >= 1000 ? x : x.toString().padStart(2, "0")).join("-") + " " + timeArray.map(x => x.toString().padStart(2, "0")).join("-") + remainder;
}
module.exports = parse_title;