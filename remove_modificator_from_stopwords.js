var predlogs = ["в", "без", "до", "из", "к", "на", "по", "о", "от", "перед", "при", "через", "с", "у", "за", "над", "об", "под", "про", "для", "вблизи",
              "и", "или", "а", "но", "либо", "если", "что", "как", "чтобы", "что", "где", "когда", "будто", "ли", "если", "вглубь", "вдоль", "возле", "около", 
                "вокруг", "впереди", "после", "можно"];

function main() {
  
  
  var keywords = AdsApp.keywords()
    .withCondition("CampaignStatus = ENABLED")
    .withCondition("AdGroupStatus = ENABLED")
    .withCondition("KeywordMatchType = BROAD")
    .withCondition("Status = ENABLED")
    .get();
  Logger.log('Total keywords: ' + keywords.totalNumEntities());
  
 while (keywords.hasNext()) {
  var keyword = keywords.next();
  if (havePredlog(keyword.getText())){
  	
    deletePredlog(keyword);
  }
}

}

function havePredlog(key){
 
  keyarray = key.split(" ");
  haveFlag = keyarray.some(function(item, i, arr) {
    if (item[0]=='+'){
      if (predlogs.indexOf(item.slice(1)) !== -1) return true;
      else return false;
   	 }
    else return false;
  });
 
  return haveFlag;
}

function deletePredlog(key){
  keyText = key.getText();
  adgroup = key.getAdGroup();
  url = key.urls();
  bidding = key.bidding();
  newKeyText = keywordWithoutPredlogModificator(keyText);
  
  adgroup.newKeywordBuilder()
  	.withText(newKeyText)
    .withCpc(bidding.getCpc())
    .build();
  
  key.remove();
  return
}


function keywordWithoutPredlogModificator(keywordText){
	keyarray = keywordText.split(" ");
  	var index, len;
	for (index = 0, len = keyarray.length; index < len; ++index) {
      if (keyarray[index][0]=="+"){
      	if (predlogs.indexOf(keyarray[index].slice(1)) !== -1){keyarray[index] = keyarray[index].slice(1)}
      }
      
	}
    newText = keyarray.join(' ');	
    return newText;
}
