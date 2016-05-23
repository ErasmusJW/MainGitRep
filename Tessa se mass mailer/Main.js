var path = require('path')
var filePath = path.join(__dirname, 'bulk.pdf')
var extract = require('pdf-text-extract')
var cp = require("child_process");
extract(filePath, function (err, pages) {
  if (err) {
    console.dir(err)
    return
  }

  var index;
  for(index = 0 ; index < pages.length; index++)
  {

    var n = pages[index].search("Account Number:");
    var substring = pages[index].substring(n+16,n+5+16);
    //console.log("\n")
      // console.log(index)
    //console.log(substring)
    substring = substring.trim()
    var index2 = index+1
    var exeName = "pdftk bulk.pdf cat "+ index2 + " output output\\" + substring + ".pdf";
    console.log(exeName)

    cp.exec(exeName);
  }


})