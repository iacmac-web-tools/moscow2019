// monkey patching the existing tokenizr
// this will be fixed in an upcoming release of lunr
lunr.tokenizer = function (str) {
    if (!str) return []
    if (Array.isArray(str)) return str.map(function (t) { return t.toLowerCase() })
    var str = str.replace(/^\s+/, '')
    for (var i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
            str = str.substring(0, i + 1)
            break
        }
    }
    return str
        .split(/\s+/)
        .map(function (token) {
            return token.toLowerCase()
        })
}

var lunrIndex, $results, pagesIndex;

// function getQueryVariable(variable) {
//     var query = window.location.search.substring(1);
//     var vars = query.split('&');

//     if (vars !== null) {
//         for (var i = 0; i < vars.length; i++) {
//             var pair = vars[i].split('=');

//             if (pair[0] === variable) {
//                 return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
//             }
//         }
//     }
// }

// var searchTerm = getQueryVariable('query');

// Initialize lunrjs using our generated index file
function initLunr() {
    // First retrieve the index file
    $.getJSON("/index.json")
        .done(function (index) {
            pagesIndex = index;
            lunrIndex = lunr(function () {
                // this.field("title", { boost: 10 });
                // this.field("tags", { boost: 5 });
                // this.field("description");
                this.ref('uri');
                this.field('title');
                this.field('lectors');
                this.field('description');
                this.field('summary');

                // using the russian language extension
                // in future versions of lunr there will be some interface for doing this
                // but for now this will do.
                lunr.ru.call(lunrIndex);

                pagesIndex.forEach(function (page) {
                    this.add(page);
                }, this)
            });
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.error("Error getting Hugo index file:", err);
        });
}

// Nothing crazy here, just hook up a listener on the input field
function initUI() {
    $results = $("#blog-listing-medium");
    $("#searchinput").keyup(function () {
        $results.empty();

        // Only trigger a search when 2 chars. at least have been provided
        var query = $(this).val();
        console.log("query = " + query);
        if (query.length < 2) {
            return;
        }

        var results = search(query);
        console.log(results);
        renderResults(results);
    });
}

/**
 * Trigger a search in lunr and transform the result
 *
 * @param  {String} query
 * @return {Array}  results
 */
function search(query) {
    return lunrIndex.search(query).map(function (result) {
        return pagesIndex.filter(function (page) {
            return page.uri === result.ref;
        })[0];
    });
}

/**
 * Display the 10 first results
 *
 * @param  {Array} results to display
 */
function renderResults(results) {
    if (!results.length) {
        $results.append("<p>Информация не найдена</p>");
        return;
    }


    results.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    // Only show the ten first results
    results.slice(0, 100).forEach(function (result) {


        var $resultstring = 
            "<a href='" + result.uri + "' class='card event-card'>" +
                "<article class='card-body'>";

        if (result.day != null) {
            $resultstring +=  "<h1>" + result.day + ", " + result.timeStart + " - " + result.timeEnd + "</h1>";
        }        
            
         $resultstring +=   "<h2 card='card-title'>" + result.title + "</h2>" + 
                "</article>" + 
            "</a>" ;
        var $result = ($resultstring);
        $results.append($result);
    });
}

initLunr();

$(document).ready(function () {
    initUI();
});