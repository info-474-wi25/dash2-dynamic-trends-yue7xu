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

// const svg2_RENAME = d3.select("#lineChart2")
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// // 2.a: LOAD...
// d3.csv("aircraft_incidents.csv").then(data => {
//     // 2.b: ... AND TRANSFORM DATA
//     // data.forEach(d => {
//     //     d["year"] = +d["Year"];
//     // });
//     data.forEach(d => {
//         d["year"] = +d["Year"];
//     });

//     console.log("Raw data:", data);
//     // console.log("Years:", data.map(d => d.year));

//     // 2.c: PREPARE DATA - Categorize Weather Conditions into Known Groups
//     const weatherCategories = ["VMC", "IMC", "NA"];
//     const categorizedData = data.map(d => ({
//         ...d,
//         weatherGroup: weatherCategories.includes(d.Weather_Condition_Cleaned) ? d.Weather_Condition_Cleaned : "Unknown"
//     }));

//     // // Check
//     // console.log("Weather Categories:", categorizedData.slice(0, 5).map(d => ({
//     //     Weather_Condition_Cleaned: d.Weather_Condition_Cleaned,
//     //     weatherGroup: d.weatherGroup
//     // })));

//     // const categories = d3.rollup(categorizedData,
//     //     v => d3.rollup(v,
//     //         values => values.length || 0,
//     //         d => d.year
//     //     ),
//     //     d => d.weatherGroup
//     // );

//     // // Check
//     // console.log("Categories:", categories);
//     const groupedData = d3.groups(categorizedData, d => d.weatherGroup, d => d.year)
//     .map(([weatherGroup, yearGroups]) => ({
//         weatherGroup,
//         values: yearGroups.map(([year, entries]) => ({
//             year,
//             count: entries.length
//         }))
//     }));
d3.csv("aircraft_incidents.csv").then(data => {
    data.forEach(d => {
        d.year = +d.Year;
        d.totalConcerned = +d.Total_Concerned;
    });
    
    const weatherCategories = ["VMC", "IMC", "UNK"];
    const categorizedData = data.map(d => ({
        year: d.year,
        totalConcerned: d.totalConcerned,
        weatherGroup: weatherCategories.includes(d.Weather_Condition_Cleaned) ? d.Weather_Condition_Cleaned : "UNK"
    }));
    
    const groupedData = Array.from(
        d3.rollup(
            categorizedData,
            v => d3.sum(v, d => d.totalConcerned),
            d => d.year,
            d => d.weatherGroup
        ),
        ([year, weatherGroups]) => ({
            year,
            values: Array.from(weatherGroups, ([weatherGroup, totalConcerned]) => ({
                weatherGroup,
                totalConcerned
            }))
        })
    ).sort((a, b) => a.year - b.year);    
    
    console.log("Grouped Data:", groupedData);

    // 3.a: SET SCALES FOR CHART 1
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(groupedData.flatMap(d => d.values.map(v => v.totalConcerned)))])
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain(weatherCategories)
        .range(["green", "red", "orange"]);
    
    // 4.a: PLOT DATA FOR CHART 1
    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.totalConcerned));

    weatherCategories.forEach(weatherGroup => {
        const filteredData = groupedData.map(d => ({
            year: d.year,
            totalConcerned: d.values.find(v => v.weatherGroup === weatherGroup)?.totalConcerned || 0
        }));

        svgLine.append("path")
            .datum(filteredData)
            .attr("fill", "none")
            .attr("stroke", colorScale(weatherGroup))
            .attr("stroke-width", 2)
            .attr("d", line);
    });

    // 5.a: ADD AXES FOR CHART 1
    svgLine.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svgLine.append("g")
        .call(d3.axisLeft(yScale));

    const legend = svgLine.append("g")
        .attr("transform", `translate(${width - 100}, 10)`);

    legend.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .text("Weather Condition")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    weatherCategories.forEach((weatherGroup, i) => {
    legend.append("rect")
        .attr("x", 0)
        .attr("y", i * 20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", colorScale(weatherGroup));
    
    legend.append("text")
        .attr("x", 20)
        .attr("y", i * 20 + 10)
        .text(weatherGroup)
        .attr("alignment-baseline", "middle")
        .style("font-size", "12px");
});

    

    // 6.a: ADD LABELS FOR CHART 1
    svgLine.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Year");

    svgLine.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Incident Count");

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