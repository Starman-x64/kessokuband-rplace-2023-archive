class DateUtils {
  shiftDateToTimeZone(dateString, timeString, utcOffset = 0) {
    let utcDateString = dateString + "T" + timeString.replace("-", ":") + ":00Z";
    let utcDate = new Date(utcDateString);
    let offsetDate = new Date();
    
    offsetDate.setTime(utcDate.getTime() - utcOffset * 3600000);
    let offsetDateString = offsetDate.toISOString();
    offsetDateString = offsetDateString.replace(/T/g, " ").replace(/(:00.000Z)/g, "").replace(/:/g, "-");
    return offsetDateString;
  }
}
