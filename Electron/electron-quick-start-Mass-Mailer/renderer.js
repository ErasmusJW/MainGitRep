// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const ipc = require('electron').ipcRenderer
var pdfTextExtractor = require('pdf-text-extract');
var cp = require("child_process");


var pdfFile = {
	inputFiles : [],
	OutputFolder
};

var Accounts = [];

const LoadPdfBtn = document.getElementById("openFile");
const ProcessBtn = document.getElementById("processFile");
const OutFolderBtn = document.getElementById("OutputFolder");
const ProgressBar = document.getElementById("progressBar");

// Object.defineProperty(pdfFile,"InPath",{
// 	set: function(value){
// 		ProcessBtn.disabled = false;		
// 	}
// })


ProcessBtn.disabled = true;


function openFile (DialogName) {
  ipc.send('open-file-dialog',[DialogName]);
}

function openFolder (DialogName) {
  ipc.send('open-folder-dialog',[DialogName]);
}


LoadPdfBtn.addEventListener('click', function (event) {
	openFile("Select the pdf containing the accounts");


})

OutFolderBtn.addEventListener('click', function (event) {
	openFolder("Select the pdf containing the accounts");


})

function ExtractPages(callback)
{
	for(var i = 0 ; i < pdfFile.inputFiles.length ; i++)
	{
		pdfTextExtractor(pdfFile.inputFiles[i] , function(err,pages){
		    if (err) {
		      console.log(err)
		      return
		    }

		    var index;
		    progressBar.max = pages.length * 10; //one to extract data and one to create pdf.
		    console.log(pages.length);
		    pdfFile.NumberOfPages = pages.length;
		    for(index = 0 ; index < pages.length; index++)
		    {

		      var n = pages[index].search("Account Number:");
		      var substring = pages[index].substring(n+16,n+5+16);
		      //console.log("\n")
		        // console.log(index)
		      //console.log(substring)
		      substring = substring.trim()
		      var index2 = index+1


	    	  // var exeName = "pdftk \"" + pdfFile.InPath + "\" cat "+ index2 + " output \"" + pdfFile.OutPath +"\\"+ substring + ".pdf \"";
		      // console.log(exeName);

		 
		      Accounts.push({
		      	PageNumber : index2,
		      	AccountNumber : substring,
		      	pdftkString : "pdftk \"" + pdfFile.inputFiles[0] + "\" cat "+ index2 + " output \"" + pdfFile.OutputFolder +"\\"+ substring + ".pdf \""

		      });
		      //console.log(pdfFile.Accounts);
		      progressBar.value += 1;

		   }
		   callback(10); ///////////////////////// 10 proccess at a time, if slow check here!

		})	
	}
}

var CreateSinglePage = function(index,NumberOfSimutanuousProcesses)
{
	     //console.log(index);
	     cp.exec( Accounts[index].pdftkString,
		  (error, stdout, stderr) => {
		//    console.log(`stdout: ${stdout}`);
		//     console.log(`stderr: ${stderr}`);
		    if (error !== null) {
		      console.log(`exec error: ${error}`);
		    }
		    progressBar.value += 9;
		    if((index + NumberOfSimutanuousProcesses) < Accounts.length)
	     		CreateSinglePage(index + NumberOfSimutanuousProcesses,NumberOfSimutanuousProcesses)
		});
}

var SplitPage = function(NumberOfSimutanuousProcesses){

	//i =< NumberOfSimutanuousProcesses &&

	for(var i = 0 ;  i < NumberOfSimutanuousProcesses && i < Accounts.length; i+= 1){
      CreateSinglePage(i,NumberOfSimutanuousProcesses)

	}

}

ProcessBtn.addEventListener('click', function (event) {
 ExtractPages(SplitPage);

})



ipc.on('selected-file', function (event, path) {
  document.getElementById('selected-file').innerHTML += `You selected: ${path}`

  pdfFile.inputFiles.push(path[0]);
  console.log("poooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
  console.log(pdfFile.inputFiles);
  if(pdfFile.OutputFolder )
  	ProcessBtn.disabled = false;

})  



ipc.on('selected-folder', function (event, path) {
  document.getElementById('OutPut-folder').innerHTML = `You selected: ${path}`
  pdfFile.OutputFolder = path[0];
  if(pdfFile.inputFiles.length > 0)
  	ProcessBtn.disabled = false;
})  