var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var pageMod = require("sdk/page-mod");
var Request = require("sdk/request").Request;
var data = require("sdk/self").data;
var text_selected = "";

var button = ToggleButton({
  id: "my-button",
  label: "my button",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onChange: handleChange
});

var Extpanel = panels.Panel({
  contentURL: data.url("myFile.html"),
  contentScriptFile: [data.url("jquery-2.2.0.min.js"), data.url("d3.v3.js"), data.url("d3.v3.min.js"), data.url("echarts.js"), data.url("pageScript.js")],
 
  onHide: handleHide,
  width: 400,
  height: 420

});

//the popup panel show event
Extpanel.on("show", function() {
  Extpanel.port.emit("show");
  Extpanel.port.emit("test", text_selected);
  
});

pageMod.PageMod({
  include: ["*"],
  contentStyleFile: data.url("css/jquery.qtip.min.css"),
  contentScriptFile: [data.url("jquery-2.2.0.min.js"), data.url("bootstrap.min.js"), data.url("jquery.qtip.min.js"), data.url("script.js")],

  onAttach: function(worker) {
    //get the title from the content script and pass to function (pass title inside)
    worker.port.on("se-link", function(data){
      console.log(data + " data from content script");
      extractExplain(worker, data);
    });

    worker.port.emit("wikiContent", "Page matches ruleset");
  }

});


function handleChange(state) {
  if (state.checked) {
    Extpanel.show({
      position: button
    });
  }
}


function handleHide() {
  button.state('window', {checked: false});
}


function getWikiInfo(worker, title){

  var time1 = new Date().getTime() / 1000;

  Request({
        url: "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&exsentences=1&titles="+ title,
        onComplete: function(response){
        //send the wiki content back to content script
        if(response.json){
            var time2 = new Date().getTime() / 1000;

            var timeConsumed = time2 - time1;

            console.log("\ntime consumed for wikiAPI: " + timeConsumed + "\n");
            console.log("getWikiInfo function true");
            var info = response.json.query.pages;
            for (var key in info){

              var wikiResult = info[key]["extract"];

            }
            // console.log("\n\nwikiresult" + wikiResult);

            worker.port.emit('Info', wikiResult);
        }else{
            console.log("getWikiInfo function false");
            worker.port.emit('Info', "No definition");
        }
      }
  }).get();

  


}

function getStackInfo(worker, text){


  var time1 = new Date().getTime() / 1000;

  Request({
        url: "https://api.stackexchange.com/2.2/tags/"+text+"/wikis?site=stackoverflow",
        onComplete: function(response){
        //send the wiki content back to content script
        if(response.json){

            var time2 = new Date().getTime() / 1000;

            var timeConsumed = time2 - time1;

            console.log("\ntime consumed for stackiAPI: " + timeConsumed + "\n");


            console.log("getWikiInfo function true");
            var stackResult = response.json;  
            var wikiResult = stackResult["items"][0]["excerpt"];
            console.log(wikiResult);
            worker.port.emit('Info', wikiResult);

        }else{
            console.log("getWikiInfo function false");
            worker.port.emit('Info', "No definition");
        }
      }
  }).get();


  

}

//get normalised form and explaination link 
function extractExplain(worker, data) {
    var domain;
    var url = data.seLink;
    var name_title = data.ntitle;

    text_selected = name_title;


    console.log("url from script:" + url);
    console.log("title from script:" + name_title);

    
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    domain = domain.split(':')[0];


    var n = url.split("/");
    var title = n[n.length - 1];
    var extractWord = n[n.length - 2];

    console.log("title from the selink:" + title);
    if(domain.indexOf("wikipedia")>-1){

      getWikiInfo(worker, title); 

    }else if(domain.indexOf("stackoverflow")>-1){

      getStackInfo(worker, extractWord);

    }

    else{

      console.log("not in wikipedia domain");
    }
}

function getData(data){
  return data;
}



