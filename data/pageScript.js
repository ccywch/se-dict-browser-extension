var languageList = ["java", "c++", "javascipt", "php", "python", "c#"];
var libRelateList = ["lib", "library", "tool", "tools", "software", "s/w", "sw"];



function getItem(){
  var input = document.getElementById("inputItem").value.toLowerCase(); 
  console.log(input);



   var result = $.ajax({type: "GET", url: "https://graphofknowledge.appspot.com/tagidjson/"+input.replace("#","+++").replace(/ /g,"&&"), async: false}).responseText;



        var tag = result.split("&&")[0];                    
        var graphResult = result.split("&&")[1];              

       //Get tagWiki content
        var wikiResult = JSON.parse($.ajax({type: "GET", url: "https://api.stackexchange.com/2.2/tags/"+tag.split("_").pop().replace(/#/g,"%23")+"/wikis?site=stackoverflow", async: false}).responseText);

    console.log(wikiResult["items"][0]["excerpt"]);
    document.getElementById("wikitag").innerHTML = wikiResult["items"][0]["excerpt"];

          
    var faqResult = JSON.parse($.ajax({type: "GET", url: "https://api.stackexchange.com/2.2/tags/"+tag.split("_").pop().replace(/#/g,"%23")+"/faq?site=stackoverflow", async: false}).responseText);

    var str1 = faqResult["items"][0]["title"];
    var res1 = str1.link(faqResult["items"][0]["link"]);

    var str2 = faqResult["items"][1]["title"];
    var res2 = str2.link(faqResult["items"][1]["link"]);
    
    var str3 = faqResult["items"][2]["title"];
    var res3 = str3.link(faqResult["items"][2]["link"]);

    var target = document.getElementById("faq");
    document.getElementById("faq").innerHTML = "Frequent Asked Questions";

    target.innerHTML = "Frequent Asked Questions<br/>1. " + res1 + "<br/>2. " +res2 +"<br/>3. " + res3;
    var l = target.getElementsByTagName("a");
    for (var n=0; n<l.length; n++){

      l[n].setAttribute("target", "_blank");

    }

}

function setQueryInput(textSelected){

  if(textSelected != ""){
    document.getElementById("inputItem").value = textSelected;
    document.getElementById("wikitag").innerHTML = "Loading.....";
    document.getElementById("faq").innerHTML = "";

    getItem();
  }
}



//task language + lib --> recomand the relate library grouped by the language
function getRelateTerms(){

  var input = document.getElementById("inputItem").value.toLowerCase(); 
  var languageRel = false;
  var libRel = false;





  for (var i=0; i<libRelateList.length-1; i++){

    if(input.indexOf(libRelateList[i])>-1){
      var inputTask = input.replace(libRelateList[i], "");
      libRel = true;
      showTaskLib(inputTask); 
    }
  }

    //use API 1 show lib group by the language
  for (var i=0; i<languageList.length-1; i++){
   
    if(input.indexOf(languageList[i])>-1){
      languageRel = true;
      var inputItem = input.replace(languageList[i], "");
      var inputLib = inputItem.replace(/^\s+|\s+$/g, "");
      if(inputLib==""){
        showTask(input);
      }else{
        showRelateLib(input, languageList[i]);
      }
    }
  }
  




  if((!libRel)&&(!languageRel)){
    showTask(input);
  }



}

function showTaskLib(searchItem){
  if(relateLib.innerHTML != ''){
    relateLib.innerHTML ="";
  }

  var input = searchItem.replace(/^\s+|\s+$/g, "");
  var inputTask = input.replace(" ", "-");
  var resultAPI2 = JSON.parse($.ajax({type: "GET", url: "http://128.199.241.136:9000/similarLib/"+inputTask, async: false}).responseText);
    console.log(resultAPI2);
    if(resultAPI2["lib_list"].length !=0){


      relateLib.innerHTML += "<div class='language-title'> <a class='head-title' href ='http://stackoverflow.com/tags/"+ inputTask + "/info' target ='_blank'><span>" + inputTask + "</span></a></div></br>";

      for(var n=0; n<resultAPI2["lib_list"].length; n++){
        var element = resultAPI2["lib_list"][n][0];
        relateLib.innerHTML += "<a class='element' href ='http://stackoverflow.com/tags/"+ element + "/info' target='_blank'>" + element +"</a>   "
        if(n==5)break;
      }
    }else{
      relateLib.innerHTML = "<b>Sorry, The word input in not in our database.</b>";
    }
}

function showRelateLib(searchItem, language){
  var result1 = searchItem.replace(language, "");
  //remove the extra spaces leave only the ones between words.
  var inputLib = result1.replace(/^\s+|\s+$/g, "");

  var relateLib = document.getElementById('relateLib');
  //clean the content
  if(relateLib.innerHTML != ''){
    relateLib.innerHTML ="";
  }

  var result = JSON.parse($.ajax({type: "GET", url: "http://128.199.241.136:9000/similarTool/"+inputLib, async: false}).responseText);
  


  if(result['plList'].length!=0){
    for(var key in result['alternative_dic']){
     relateLib.innerHTML += "<div class='language-title'> <a class='head-title' href ='http://stackoverflow.com/tags/"+ key + "/info' target ='_blank'><span>" + key + "</span></a></div></br>";
      

      for(var m=0; m<result['alternative_dic'][key].length; m++){
        //related library
        var element =result['alternative_dic'][key][m].split("_")[0];
        relateLib.innerHTML += "<a class='element' href ='http://stackoverflow.com/tags/"+ element + "/info' target='_blank'>" + element +"</a>   ";
      }
      relateLib.innerHTML+="</br></br>";
    }
  }else{
    showTask(inputLib);
  
  } 

}


function showTask(inputItem){

  if(relateLib.innerHTML != ''){
    relateLib.innerHTML ="";
  }
  var inputRelate = inputItem.replace(" ", "-");
  //get the result from API2 the relate libaray form the input item(task, language, lib) and other concept
  var resultAPI2 = JSON.parse($.ajax({type: "GET", url: "http://128.199.241.136:9000/similarLib/"+inputRelate, async: false}).responseText);

  if(resultAPI2["lib_list"].length !=0){

    
    relateLib.innerHTML += "<div class='language-title'> <a class='head-title' href ='http://stackoverflow.com/tags/"+ inputRelate + "/info' target ='_blank'><span>" + inputRelate + "</span></a></div></br>";

    for(var n=0; n<resultAPI2["lib_list"].length; n++){
      var element = resultAPI2["lib_list"][n][0];
      relateLib.innerHTML += "<a class='element' href ='http://stackoverflow.com/tags/"+ element + "/info' target='_blank'>" + element +"</a>   "
      if(n==5)break;
    }

    relateLib.innerHTML += "<hr/><div class='sub-title'>Concepts Related:</div>";

    for(var p=0; p<resultAPI2['concept_list'].length; p++){

      var element = resultAPI2['concept_list'][p];

      relateLib.innerHTML += "<a class='element' href ='http://stackoverflow.com/tags/"+ element + "/info' target='_blank'>" + element +"</a>   "
      if(p==5)break;      
    }

  }else{
    relateLib.innerHTML = "<b>Sorry, No result found in our database.</b>";
  } 

}

self.port.on("show", function onShow() {
  self.port.on("test", function(message) {
      if(message != document.getElementById("inputItem").value){
      console.log("message get from Expanel" + message);
      setQueryInput(message);
    }

  });
});



function getTrendline(){
  
  var input = document.getElementById("inputItem").value.toLowerCase(); 
  var arrX = new Array();
  var arrY = new Array();

  var trendlineResult = JSON.parse($.ajax({type: "GET", url: "http://128.199.241.136:9000/tagTrend/"+input, async: false}).responseText);
  
  var tagTrend = trendlineResult["tag_trend"];
  for (var i =0; i<tagTrend.length; i++){
    arrX.push(tagTrend[i]["date"]);
    arrY.push(tagTrend[i][input]);
  }

  


  var myChart = echarts.init(document.getElementById('trendline'));

  var option = {
      title: {
          text: 'Tag Trend'
      },

      tooltip: {
        trigger: 'axis'
      },
      legend: {
          data:[input]
      },
      
      xAxis: {
        data: arrX
      },
      yAxis: {
        name: 'Questions',
        type: 'value'

      },
      dataZoom: [{   
            type: 'slider', 
            start: 50,      
            end: 100         
        }
      ],
      series: [{
          name: input,
          type: 'line',
          data: arrY
      }]
  };

  
  myChart.setOption(option);
}









