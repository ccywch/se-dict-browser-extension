self.port.on("wikiContent", function(message) {
  console.log(message);
});



var select_times = 0;
$(function(){
    $(document.body).bind('mouseup', function(e){
        var selection;
        var more_link = "<div align ='right'><a id='link' href = 'https://se-dictionary.appspot.com/";
        
        if (window.getSelection) {
          selection = window.getSelection();
        } else if (document.selection) {
          selection = document.selection.createRange();
        }

        //control the selected word send to backend
        var wordCount = selection.toString().split(" ").length;
        


    
        if (selection.toString() !== ''  && wordCount<=3){

            //---------send the selected text to index.js---------


            select_times = select_times + 1;

            var selection1= window.getSelection().getRangeAt(0);
            var selectedText = selection1.extractContents();


            //create the span tag for the webpage to append the too
            var span= document.createElement("span");
            span.setAttribute("id", "selected" + select_times);
            

            span.appendChild(selectedText);

            selection1.insertNode(span);

            console.log(selection.toString());
            var seltext = selection.toString();
            console.log("text selected before sent back"+ seltext);


            var time1 = new Date().getTime() / 1000;
            var seResult = JSON.parse($.ajax({type: "GET", url: "https://se-dictionary.appspot.com/api/" + selection.toString().toLowerCase(), async:false}).responseText);
            
            var time2 = new Date().getTime() / 1000;

            var timeConsumed = time2 - time1;

            console.log("\ntime consumed for se-dict: " + timeConsumed + "\n");

            var seLink = seResult["wikiLink"][0];
            var ntitle = seResult["name"];



            console.log("selink is" + seLink);
            

            
            if(seLink){

                console.log("seLink have value");
                var alterMean = "";
                if(ntitle.length >1){
                    alterMean = "<span><b>Alternative Meaning:</b>   </span>";
                    for(var nameIndex=1; nameIndex<ntitle.length; nameIndex++){
                        alterMean += ntitle[nameIndex];
                        
                        if(nameIndex>=1&& nameIndex!=ntitle.length-1){
                            alterMean += ", ";
                        }
                    }
                }
              

                var termWordArray = [];
                var termLinkArray = [];

              
                var relevantWord = seResult["relevantWords"];
                for(var i =0; i<relevantWord.length; i++){
                    for (var key in relevantWord[i]){
                        console.log("key:" + key + " value:" + relevantWord[i][key]);
                        termWordArray.push(key);
                        termLinkArray.push(relevantWord[i][key]);
                    }
                }

                console.log(ntitle);
                console.log("link get form se-dictionary" + seLink);

               
                var relateTerms ="<span><b>Relate Terms:</b>   </span>";
                for (var n=0; n<relevantWord.length; n++){
                    relateTerms = relateTerms + "<a id='term' href='"+ termLinkArray[n]+ "'>"+ termWordArray[n] +"</a>   ";
                }

                


                self.port.emit("se-link", {seLink: seLink, ntitle: ntitle});
                self.port.emit("select-text", ntitle);
                var expResult = "";
                


                self.port.on("Info", function(expResult){

                   

                    more_link = more_link + "/term/" + selection.toString().toLowerCase() + "'style='text-decoration:none' target='_blank'>More</a></div>";
                        
                    console.log("\n\n + before qtip\n" +  expResult);
                    
                    $('#selected' + select_times).qtip({
                        content: {
                            text: expResult + "<br/>" + relateTerms + "<br/>" + alterMean + more_link,
                            title: ntitle[0],
                            button: close
                        },
                        style: {
                            classes: 'qtip-bootstrap'
                            
                        },
                        show: true,
                        hide: 'unfocus'
                    });

                });
            }else{

                console.log("value not definded");
                $('#selected' + select_times).qtip({
                    content:{
                        text: 'No Result Found.'
                    },
                    style: {
                        classes: 'qtip-tipsy qtip-shadow'
                    },
                    show: true,
                    
                });

            }
        }
    });

});



//get the width of the selection range
function getSelectionWidth() {
    var sel = document.selection, range;
    var width = 0;
    if (sel) {
        if (sel.type != "Control") {
            range = sel.createRange();
            width = range.boundingWidth;
            height = range.boundingHeight;
        }
    } else if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0).cloneRange();
            if (range.getBoundingClientRect) {
                var rect = range.getBoundingClientRect();
                width = rect.right - rect.left;
            }
        }
    }
    return width;
}

