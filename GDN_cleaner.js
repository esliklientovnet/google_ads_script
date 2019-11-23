function main() {
  
  
  var badWords = ['.ua', 'gta', 'dota', 'minecraft', 'resheb', 'referat', 'igry','igra', 'igri', 'game', 'flash', 'apk', 'android', 'app',
                  'mp3', 'fb2', 'dating', 'goroskop', 'astro', 'film', 'video', 'movie', 'book', 'download', 'torrent', 'kino', 'radio', 
                  'weather', 'pesni', 'chords', 'anekdot', 'zodiak', 'minusovk', 'knig', 'recept', 'recipe', 'spongebob', 'barbie', 
                  'skyrim', 'ferma', 'dom2', 'mafia', 'gadani', 'mario', 'epub', '2048', 'dendy', 'sega', 'zuma', 'aforizm', 'citat', 'pdf', 'gdz'];

  
  labelNames="CleanerGDN"; //Ярлык кампаний, которые участвуют в анализе
  var maxClick = 100; //Максимальное число кликов без конверсии, при котором площадка исключается
  var maxCost = 2000; //маклимальные затраты на конверсию
  var lowCtr = 0.1; ////Площадки с CTR меньше lowCtr отключаются
  var lowImpressions = 10000; //при числе показов не менее lowImpressions 
  var ignoreAnonymous = 1; //Игнорировать anonymous.google, 0 будет исключать
  var during = "LAST_30_DAYS"; //Период сбора данных
  
  //TODAY | YESTERDAY | LAST_7_DAYS | THIS_WEEK_SUN_TODAY | THIS_WEEK_MON_TODAY | LAST_WEEK |
  //LAST_14_DAYS | LAST_30_DAYS | LAST_BUSINESS_WEEK | LAST_WEEK_SUN_SAT | THIS_MONTH
  
 
  var campaignArray = [];
  var excludePlacementArray = [];
  var campaigns="";
  var campaignSelector = AdWordsApp
     .campaigns()
     .withCondition("LabelNames CONTAINS_ANY ['"+labelNames+"']");

 var campaignIterator = campaignSelector.get();
 while (campaignIterator.hasNext()) {
   campaignArray.push( "'"+campaignIterator.next().getName()+"'" ); 
 }
  
  campaigns = campaignArray.join(',');
  Logger.log("Campaigns: " + campaigns);

 
  var report = AdWordsApp.report("SELECT Domain, Clicks, Impressions, Ctr, Conversions, Cost, CostPerConversion " +
"FROM AUTOMATIC_PLACEMENTS_PERFORMANCE_REPORT " + 
"WHERE CampaignName IN ["+ campaigns +"] " +
"DURING " + during);
 var rows = report.rows();
  while (rows.hasNext()) {
    var row = rows.next();
    var domain = row['Domain'];
    var clicks = row['Clicks'];
    var impressions = row['Impressions'];
    var сonversions = row['Conversions'];
    var cost = row['Cost'];
    var costPerConversion = row['CostPerConversion'];
    var ctr = row['Ctr'];
    
  if (ignoreAnonymous && domain.toString()=="anonymous.google") continue;
    //Cost
    if ((clicks >= maxClick) && (сonversions< 1)) {
      Logger.log('Big cost without conversion: '+ domain.toString());
      excludePlacementArray.push(domain.toString());
    }
    
    //LEAD COST
    if (costPerConversion>= maxCost) {
        Logger.log('Big cost: '+ domain.toString());
        excludePlacementArray.push(domain.toString());
    }
    
    //LOWER
     if ((clicks/impressions*100 <= lowCtr) && (impressions >= lowImpressions) && (сonversions< 1)) {
       Logger.log('Low CTR: '+ domain.toString());
      excludePlacementArray.push(domain.toString());
    }
    
    //BAD WORDS
     if (containsAny(domain.toString(),badWords) && (сonversions< 1)) {
       Logger.log('Contains bad word CTR: '+ domain.toString());
      excludePlacementArray.push(domain.toString());
    }
  }
  if (excludePlacementArray.length){
  addNegativePlacements(excludePlacementArray);
  }
  else {
    Logger.log('Nothing domain to exclude');
  }

}

function addNegativePlacements(negativePlacements) {
var campaignIterator = AdWordsApp.campaigns()
.withCondition("LabelNames CONTAINS_ANY [" + labelNames + "]").get();
while (campaignIterator.hasNext()) {
var campaign = campaignIterator.next();

negativePlacements.forEach(function(entry) {
excludePlacement = campaign.display().newPlacementBuilder();
excludePlacement.withUrl(entry.toString()).exclude();
  Logger.log('Excluded: '+ entry.toString());
});
}
}

//Проверка наличия текста из массива
function containsAny(str, substrings) {
    for (var i = 0; i != substrings.length; i++) {
       var substring = substrings[i];
       if (str.indexOf(substring) != - 1) {
         return true;
       }
    }
    return false; 
}
