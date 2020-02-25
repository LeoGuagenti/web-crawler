var go = require('needle')
var cheerio = require('cheerio');
var parse = require('url-parse');


var WebCrawler = (url) => {
    var visited = [],
        to_visit = [url],
        currentLink;

    var crawl = async () => {
        console.log(`To Visit: [\n\t${to_visit.join('\n\t')}\n]`);
        console.log(`Visited: [\n\t${visited.join('\n\t')}\n]`);

        if(to_visit.length != 0){
            currentLink = to_visit.pop();
        }else{
            console.log('No more pages to visit.');
            return;
        }
        
        if(visited.includes(currentLink) || currentLink === undefined){
            crawl();
        }else{
            await visitPage();
            crawl();
        }
    }

    var visitPage = () => {
        visited.push(currentLink);
        var link = currentLink;

        console.log(`--> ${currentLink}`);
        return new Promise((resolve, reject) => {
            go.get(link, function(error, response){
                if(error){
                    console.log('\tError connecting to page.'); 
                    resolve(`ResolveError: ${error}`);
                }
    
                if(response.statusCode !== 200){
                    console.log(`Failed to connect, status code > ${response.statusCode}`);
                    resolve('ResolveError: Invalid Status Code');
                }else{
                    var DOM = cheerio.load(response.body);
                    console.log(`\tLinks Found: ${DOM('a').length}`);

                    DOM('a').each(async (i, url) => {
                        await cleanLink(DOM(url).attr('href'), link);
                    });
                    resolve('Resolved Successfully');
                }
            });
        });
    }

    var cleanLink = (uncleanLink, host) => {
        return new Promise((resolve, reject) => {
            if(uncleanLink === undefined){
                console.log('Link is unfortunantly undefined');
                resolve('invalid');
                return;
            }
    
            //this logic is all fucked
            
            if(uncleanLink.search("boards.4chan.org") !== -1){
                if(link.search("http") === -1){
                    resolve('https:'.concat(uncleanLink));
                }else{
                    resolve(uncleanLink);
                }
            }else if(uncleanLink.search("thread") !== -1 && uncleanLink.search("#") === -1 && uncleanLink.search("boards.4chan.org") === -1){
                resolve(`${host}${uncleanLink}`);
            }else{
                console.log(uncleanLink);
                resolve('invalid');
            } 
        }).then((cleanedLink) => {
            if(cleanedLink != 'invalid'){
                to_visit.push(cleanedLink);
            }
        })
    }
    
    //initial call
    crawl();
}


WebCrawler('https://www.4chan.org/');