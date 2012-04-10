var monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

String.prototype.splice = function( idx, rem, s ) {
  return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

function prettifyDate(date) {
  console.log("Parsing", date);

  var parsedDate = Date.parseExact(date.splice(4, 0, "-" ).splice(7, 0, "-" ), "yyyy-MM-dd");

  if (parsedDate) {
    var day = parsedDate.getDate();
    var month = parsedDate.getMonth();
    var year = parsedDate.getFullYear();

    var prefixes = ["th", "st", "nd", "rd"];
    var prefix = day > 3 ? prefixes[0] : prefixes[day];

    return monthNames[month] + " " + day + prefix + ", " + year;
  }
  return null;
}
