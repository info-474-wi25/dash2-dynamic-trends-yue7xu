// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svgLine = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svg2_RENAME = d3.select("#lineChart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("aircraft_incidents.csv").then(data => {
    // 2.b: ... AND TRANSFORM DATA
    data.forEach(d => {
        d["year"] = +d["Year"];
    });

    console.log("Raw data:", data);
    console.log("Years:", data.map(d => d.year));

    // 2.c: PREPARE DATA - Categorize Weather Conditions into Known Groups
    const weatherCategories = ["VMC", "IMC", "NA"];
    const categorizedData = data.map(d => ({
        ...d,
        weatherGroup: weatherCategories.includes(d.Weather_Condition_Cleaned) ? d.Weather_Condition_Cleaned : "Unknown"
    }));

    // Check
    console.log("Weather Categories:", categorizedData.slice(0, 5).map(d => ({
        Weather_Condition_Cleaned: d.Weather_Condition_Cleaned,
        weatherGroup: d.weatherGroup
    })));

    const categories = d3.rollup(categorizedData,
        v => d3.rollup(v,
            values => values.length || 0,
            d => d.year
        ),
        d => d.weatherGroup
    );

    // Check
    console.log("Categories:", categories);

    // 3.a: SET SCALES FOR CHART 1

    
    // 4.a: PLOT DATA FOR CHART 1


    // 5.a: ADD AXES FOR CHART 1


    // 6.a: ADD LABELS FOR CHART 1


    // 7.a: ADD INTERACTIVITY FOR CHART 1
    

    // ==========================================
    //         CHART 2 (if applicable)
    // ==========================================

    // 3.b: SET SCALES FOR CHART 2


    // 4.b: PLOT DATA FOR CHART 2


    // 5.b: ADD AXES FOR CHART 


    // 6.b: ADD LABELS FOR CHART 2


    // 7.b: ADD INTERACTIVITY FOR CHART 2


});