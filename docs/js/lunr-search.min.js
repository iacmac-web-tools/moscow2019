lunr.tokenizer=function(str){if(!str)return[]
if(Array.isArray(str))return str.map(function(t){return t.toLowerCase()})
var str=str.replace(/^\s+/,'')
for(var i=str.length-1;i>=0;i--){if(/\S/.test(str.charAt(i))){str=str.substring(0,i+1)
break}}
return str.split(/\s+/).map(function(token){return token.toLowerCase()})}
var lunrIndex,$results,pagesIndex;function initLunr(){$.getJSON("/index.json").done(function(index){pagesIndex=index;lunrIndex=lunr(function(){this.ref('uri');this.field('title');this.field('description');this.field('summary');lunr.ru.call(lunrIndex);pagesIndex.forEach(function(page){this.add(page);},this)});}).fail(function(jqxhr,textStatus,error){var err=textStatus+", "+error;console.error("Error getting Hugo index file:",err);});}
function initUI(){$results=$("#blog-listing-medium");$("#searchinput").keyup(function(){$results.empty();var query=$(this).val();console.log("query = "+query);if(query.length<2){return;}
var results=search(query);console.log(results);renderResults(results);});}
function search(query){return lunrIndex.search(query).map(function(result){return pagesIndex.filter(function(page){return page.uri===result.ref;})[0];});}
function renderResults(results){if(!results.length){$results.append("<p>Информация не найдена</p>");return;}
results.sort(function(a,b){return new Date(b.date)-new Date(a.date);});results.slice(0,100).forEach(function(result){var $resultstring="<a href='"+result.uri+"' class='card event-card'>"+
"<article class='card-body'>";if(result.day!=null){$resultstring+="<h1>"+result.day+", "+result.timeStart+" - "+result.timeEnd+"</h1>";}
$resultstring+="<h2 card='card-title'>"+result.title+"</h2>"+
"</article>"+
"</a>";var $result=($resultstring);$results.append($result);});}
initLunr();$(document).ready(function(){initUI();});