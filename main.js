// 1: SET GLOBAL VARIABLES
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
        d.totalConcerned = d.totalFatalInjuries + d.totalSeriousInjuries + d.totalUninjured;
    });

    const weatherCategories = ["VMC", "IMC", "UNK"];

    // ✅ 修正 groupedData 计算
    const groupedData = Array.from(
        d3.rollup(
            data,
            v => ({
                totalFatalInjuries: d3.sum(v, d => d.totalFatalInjuries),
                totalSeriousInjuries: d3.sum(v, d => d.totalSeriousInjuries),
                totalUninjured: d3.sum(v, d => d.totalUninjured),
                totalConcerned: d3.sum(v, d => d.totalConcerned),
            }),
            d => d.year,
            d => d.Weather_Condition_Cleaned
        ),
        ([year, weatherGroups]) => ({
            year,
            values: weatherCategories.map(weatherGroup => {
                const dataObj = weatherGroups.get(weatherGroup) || {}; // 确保不会 undefined
                return {
                    weatherGroup,
                    totalFatalInjuries: dataObj.totalFatalInjuries || 0,
                    totalSeriousInjuries: dataObj.totalSeriousInjuries || 0,
                    totalUninjured: dataObj.totalUninjured || 0,
                    totalConcerned: dataObj.totalConcerned || 0
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
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    // ✅ 确保 Y 轴 class 存在
    const yAxis = svgLine.append("g")
        .attr("class", "y-axis"); 

    function updateChart(selectedCategory) {
        // 过滤并格式化数据
        const filteredData = groupedData.map(d => ({
            year: d.year,
            values: d.values.map(v => ({
                weatherGroup: v.weatherGroup,
                count: v[selectedCategory] || 0 
            }))
        }));

        // ✅ 修正 Y 轴范围计算
        yScale.domain([
            0,
            d3.max(filteredData.flatMap(d => d.values.map(v => v.count)))
        ]);

        // ✅ 移除旧的折线
        svgLine.selectAll(".data-line").remove();

        // ✅ 绘制新折线
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

        // ✅ 确保 Y 轴更新
        svgLine.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(yScale));
    }        

    // ✅ 修正 trendline 监听
    d3.select("#trendline-toggle").on("change", function() {
        const isChecked = d3.select(this).property("checked"); 
        const selectedCategory = d3.select("#categorySelect").property("value");

        if (isChecked) {
            drawTrendline(selectedCategory);
        } else {
            svgLine.selectAll(".trendline").remove();
        }
    });

    // ✅ 绑定事件监听到 dropdown
    d3.select("#categorySelect").on("change", function () {
        const selectedCategory = d3.select(this).property("value");
        updateChart(selectedCategory);
    });

    // ✅ 默认加载图表
    updateChart("totalConcerned");
});