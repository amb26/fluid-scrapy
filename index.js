var fluid = require("infusion"),
    cheerio = require("cheerio");

require("kettle");

fluid.setLogging(true);

fluid.defaults("fluid.scrapy.dataSource", {
    gradeNames: "kettle.dataSource.URL",
    // Many sites will reject a request without some form of User-Agent header - this is a random one
    headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36"
    },
    components: { 
        encoding: {
            type: "kettle.dataSource.encoding.none"
        }
    }
});

fluid.defaults("fluid.scrapy", {
    gradeNames: "fluid.component",
    urlPattern: "http://thing",
    selectorMap: {
        blocks: "div"
    },
    listeners: {
        "onCreate.populate": "fluid.scrapy.populate"
    },
    components: {
        dataSource: {
            type: "fluid.scrapy.dataSource",
            options: {
                url: "{scrapy}.options.urlPattern"
            }
        }
    }
});

fluid.scrapy.populate = function (that) {
    var page = that.dataSource.get();
    var selectorMap = that.options.selectorMap;
    page.then(function (doc) {
        console.log("Got document length " + doc.length + " starting with " + doc.substring(0, 128));
        var parsed = cheerio.load(doc);
        var blocks = fluid.makeArray(parsed(selectorMap.blocks));
        console.log("Found " + blocks.length + " blocks");
        var titles = blocks.map(function (node) {
            var title = cheerio(".ontario-assessment-centre__title", node);
            var text = title.text();
            return text;
        });
        console.log("Got titles ", titles.sort().join("\n"));
    }, function (err) {
        console.log("Got error ", err);
    });
};

var scrapy = fluid.scrapy({
    urlPattern: "https://covid-19.ontario.ca/assessment-centre-locations/",
    selectorMap: {
        blocks: "#main-content .ontario-assessment-centre__primary-info"
    },
});
