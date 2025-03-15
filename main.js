const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svgLine = d3.select("#lineChart1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("aircraft_incidents.csv").then(data => {
    data.forEach(d => {
        d.year = +d.Year;
        d.totalFatalInjuries = +d.Total_Fatal_Injuries;
        d.totalSeriousInjuries = +d.Total_Serious_Injuries;
        d.totalUninjured = +d.Total_Uninjured;
    });

    const weatherCategoryMap = {
        "VMC": "Visual Meteorological Conditions",
        "IMC": "Instrument Meteorological Conditions",
        "UNK": "Unknown Weather Conditions"
    };

    const weatherCategories = Object.keys(weatherCategoryMap);

    const groupedData = Array.from(
        d3.rollup(
            data,
            v => ({
                totalFatalInjuries: d3.sum(v, d => d.totalFatalInjuries),
                totalSeriousInjuries: d3.sum(v, d => d.totalSeriousInjuries),
                totalUninjured: d3.sum(v, d => d.totalUninjured),
            }),
            d => d.year,
            d => d.Weather_Condition_Cleaned
        ),
        ([year, weatherGroups]) => ({
            year,
            values: weatherCategories.map(weatherGroup => {
                const dataObj = weatherGroups.get(weatherGroup) || {};
                return {
                    weatherGroup, // Keep the original dataset label
                    totalFatalInjuries: dataObj.totalFatalInjuries || 0,
                    totalSeriousInjuries: dataObj.totalSeriousInjuries || 0,
                    totalUninjured: dataObj.totalUninjured || 0
                };
            })
        })
    ).sort((a, b) => a.year - b.year);

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, width]);

    const yScale = d3.scaleLinear().range([height, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain(weatherCategories)
        .range(["green", "red", "orange"]);

    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.count)); 

    svgLine.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("class", "x-axis")
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    const yAxis = svgLine.append("g")
        .attr("class", "y-axis");

    svgLine.append("text")
        .attr("id", "x-axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Year");

    svgLine.append("text")
        .attr("id", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Related People Count");

    const legend = svgLine.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${width - 200}, -10)`);

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
            .text(weatherCategoryMap[weatherGroup]) // Map dataset labels to readable names
            .attr("alignment-baseline", "middle")
            .style("font-size", "12px");
    });

    function updateChart(selectedCategory) {
        const filteredData = groupedData.map(d => ({
            year: d.year,
            values: d.values.map(v => ({
                weatherGroup: v.weatherGroup, // Keep dataset labels
                count: v[selectedCategory] || 0 
            }))
        }));

        yScale.domain([
            0,
            d3.max(filteredData.flatMap(d => d.values.map(v => v.count)))
        ]);

        svgLine.selectAll(".data-line").remove();

        weatherCategories.forEach(weatherGroup => {
            const lineData = filteredData.map(d => ({
                year: d.year,
                count: d.values.find(v => v.weatherGroup === weatherGroup)?.count || 0
            }));

            svgLine.append("path")
                .datum(lineData)
                .attr("class", "data-line")
                .attr("fill", "none")
                .attr("stroke", colorScale(weatherGroup))
                .attr("stroke-width", 2)
                .attr("d", line);
        });

        svgLine.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(yScale));

        svgLine.select(".x-axis")
            .transition()
            .duration(1000)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    }        

    d3.select("#trendline-toggle").on("change", function() {
        const isChecked = d3.select(this).property("checked"); 
        const selectedCategory = d3.select("#categorySelect").property("value");

        if (isChecked) {
            drawTrendline(selectedCategory);
        } else {
            svgLine.selectAll(".trendline").remove();
        }
    });

    d3.select("#categorySelect").on("change", function () {
        const selectedCategory = d3.select(this).property("value");
        updateChart(selectedCategory);
    });

    updateChart("totalFatalInjuries");
});
