function parse_title(title) {
  var dateArray = [2023, 7, 20];
  var timeArray = title.slice(0, 6).split("-").map(x => parseInt(x));
  var remainder = title.slice(6);
  // add seven hours to time to make it utc+0
  timeArray[0] += 7; 
  // adjust date if needed
  if (timeArray[0] >= 24) {
    timeArray[0] %= 24;
    dateArray[2]++;
    // won't have to worry about incrementing the month or year as it ended on the 25th
  }
  remainder = remainder == "" ? "" : " " + remainder;
  return dateArray.map(x => x >= 1000 ? x : x.toString().padStart(2, "0")).join("-") + "_" + timeArray.map(x => x.toString().padStart(2, "0")).join("-") + remainder;
}
module.exports = parse_title;