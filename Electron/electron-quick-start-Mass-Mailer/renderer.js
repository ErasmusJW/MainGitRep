// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.




//var pdfReader = hummus.createReader('./TestMaterials/XObjectContent.PDF');
















const ipc = require('electron').ipcRenderer
var pdfTextExtractor = require('pdf-text-extract');
var cp = require("child_process");


var pdfFile = {
	inputFiles : [],
	OutputFolder : null
};

var Accounts = [];

// bootyBar is a wrapper for bootstrap progress bar to act like html 5 progress bar
var bootyBar ={
	min : 0,
	max :100, //defualts to 100
	Internalvalue :0,
	domElement : null
}

Object.defineProperty(bootyBar, "barValue", {

	get: function() { return Math.round( this.Internalvalue / (this.max - this.min) * 100 );  },
	set: function(newValue) 
	{ 
		this.Internalvalue  =  newValue / 100 * this.max;
	}
});

Object.defineProperty(bootyBar, "value", {

	get: function() { return this.Internalvalue },
	set: function(newValue) 
	{ 
		this.Internalvalue  =  newValue;
		if(this.domElement)
		{
			this.domElement.style.width = this.barValue + "%";

		}
	}

});

bootyBar.domElement = document.getElementById("BootstrapprogressBar");



const LoadPdfBtn = document.getElementById("openFile");
const ProcessBtn = document.getElementById("processFile");
const OutFolderBtn = document.getElementById("OutputFolder");


const StatusText = document.getElementById("processing");
const CloseModalBtn = document.getElementById("CloseModal")

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

		    bootyBar.max = pages.length * 10; 

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

		      var OneAccount = {
		      	PageNumber : index2,
		      	AccountNumber : substring,
		      	pdftkString : "pdftk \"" + pdfFile.inputFiles[0] + "\" cat "+ index2 + " output \"" + pdfFile.OutputFolder +"\\"+ substring + ".pdf \""

		      }
		 	

		      	

		      Accounts.push(OneAccount);
		     

		      bootyBar.value +=  1;


		   }
		   // console.log(Accounts);
		   callback(10); ///////////////////////// 10 proccess at a time, if slow check here!

		})	
	}
}

var CreateSinglePage = function(index,NumberOfSimutanuousProcesses)
{
	     //console.log(index);
	     StatusText.innerHTML = `Processing account number` + Accounts[index].AccountNumber;
	     cp.exec( Accounts[index].pdftkString,
		  (error, stdout, stderr) => {
		//    console.log(`stdout: ${stdout}`);
		//     console.log(`stderr: ${stderr}`);
		    if (error !== null) {
		      console.log(`exec error: ${error}`);
		    }

		    bootyBar.value +=  9;
		    if((index + NumberOfSimutanuousProcesses) < Accounts.length)
	     		CreateSinglePage(index + NumberOfSimutanuousProcesses,NumberOfSimutanuousProcesses)
	     	else if(bootyBar.value >= bootyBar.max)
	     	{

	     	
	     			//$('#ProcessingModal').modal('hide');

	     			$('#baaaar').hide();
	     			$('#CloseModal').hide().removeClass('hide').slideDown('fast');
	     			//$('#CloseModal').removeClass('hide');


	     	}
		});
}

var SplitPage = function(NumberOfSimutanuousProcesses){

	//i =< NumberOfSimutanuousProcesses &&

	for(var i = 0 ;  i < NumberOfSimutanuousProcesses && i < Accounts.length; i+= 1){
      CreateSinglePage(i,NumberOfSimutanuousProcesses)

	}

}

ProcessBtn.addEventListener('click', function (event) {
	//$('#ProcessingModal').modal(options)
	$('#ProcessingModal').modal('show');
	 ExtractPages(SplitPage);
	 this.disabled = true;

	 bootyBar.value = 0;

})
CloseModalBtn.addEventListener('click', function(event){
	$('#ProcessingModal').modal('hide');
})

var AddRemoveButton = function(element,AdditionalclickEvent)
{
    var ElementId = element.getAttribute("id");

    var x = document.createElement("button");
    var btnText = document.createTextNode("Remove");
    x.appendChild(btnText);
    x.className = "btn btn-link";
    x.addEventListener('click', function(event){

		var the_node=document.getElementById(ElementId);
        the_node.parentNode.removeChild(the_node);


    	AdditionalclickEvent(event);

    })


    AdditionalclickEvent
    element.appendChild(x);	
}

ipc.on('selected-file', function (event, path) {

	
	if (pdfFile.inputFiles.indexOf(path[0]) > -1)
	{
		console.log("alreadyAdded");
			
	}
	else
	{
		
		var theDiv = document.getElementById('fileList');

	    var para = document.createElement("P");
	    para.setAttribute("id", path[0]);
	    var t = document.createTextNode(path);
	    para.appendChild(t);

		AddRemoveButton(para,function(event){
       		let index = pdfFile.inputFiles.indexOf(path[0]);
	        if ( index > -1)
	        {
	        	 pdfFile.inputFiles.splice(index,1);
	        }

	})




		theDiv.appendChild(para);

		pdfFile.inputFiles.push(path[0]);
		console.log(para);
	}





	// document.getElementById('remove-file').innerHTML += `Remove`
	// var theDiv = document.getElementById('selected-file').innerHTML += `${path}`
	// document.getElementById('remove-file').innerHTML += `Remove`


	// var this_div = document.createElement("div"); 


 	

  if(pdfFile.OutputFolder )
  	ProcessBtn.disabled = false;

})  



ipc.on('selected-folder', function (event, path) {
  document.getElementById('OutPut-folder').innerHTML = `${path}`
  pdfFile.OutputFolder = path[0];
  if(pdfFile.inputFiles.length > 0)
  	ProcessBtn.disabled = false;
})  