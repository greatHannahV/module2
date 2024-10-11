import { sampleData } from "../sampleData/data.js";
import CustomCrosstoolDrawer from "./drawer.js";
import { generateHistoricalData } from "../sampleData/historyData.js";

const selectedCompany = JSON.parse(localStorage.getItem("selectedCompany"));
const settings = document.querySelector(".settings");

// save data to localStorage
const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// load data from localStorage
const loadFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

let historicalData = loadFromLocalStorage("historicalData");

if (!historicalData) {
  historicalData = generateHistoricalData(sampleData, 100);
  saveToLocalStorage("historicalData", historicalData);
}

const matchedCompany = sampleData.filter(
  (company) => company.name === selectedCompany.name
)[0];

const matchedCompanyHistoricalData = historicalData.filter(
  (company) => company.name === matchedCompany.name
);

const combinedData = [matchedCompany, ...matchedCompanyHistoricalData];

if (selectedCompany) {
  const stockHistoryName = document.createElement("h1");
  stockHistoryName.classList.add("history-name");
  stockHistoryName.textContent = selectedCompany.name;

  const stockHistoryDetails = document.createElement("div");
  stockHistoryDetails.classList.add("stock-details");

  // Create elements for each stock detail
  const currentPrice = document.createElement("p");
  currentPrice.textContent = `Current Price: ${matchedCompany.last}`;

  const priceChangeAmount = document.createElement("p");
  priceChangeAmount.textContent = `Price Change Amount: ${(
    matchedCompany.last - matchedCompany.previous
  ).toFixed(2)}`;

  const priceChangeRate = document.createElement("p");
  priceChangeRate.textContent = `Price Change Rate: ${matchedCompany.percent}`;
  const tradeTime = document.createElement("p");
  tradeTime.textContent = `Date: ${matchedCompany.tradeTime}`;

  stockHistoryDetails.appendChild(currentPrice);
  stockHistoryDetails.appendChild(priceChangeAmount);
  stockHistoryDetails.appendChild(priceChangeRate);
  stockHistoryDetails.appendChild(tradeTime);

  settings.prepend(stockHistoryName, stockHistoryDetails);

  const container = document.getElementById("dxcharts_lite");
  const chartInstance = DXChart.createChart(container, {
    components: {
      crossTool: {
        type: "none",
        xAxisLabelFormat: [{ format: "dd.MM HH:mm" }],
        xLabel: {
          padding: {
            top: 4,
            bottom: 4,
            right: 8,
            left: 8,
          },
          margin: {
            top: 0,
          },
        },
        magnetTarget: "C",
        visible: false,
        type: "cross-and-labels",
      },
    },
  });

  function mapMatchedCompanyToCandlesData(item) {
    return {
      hi: parseFloat(item.hi),
      lo: parseFloat(item.lo),
      open: parseFloat(item.open),
      close: parseFloat(item.close),
      timestamp: item.timestamp,
      volume: item.volume,
      isVisible: item.isVisible,
    };
  }

  // Map combinedData to candles format
  const candles = combinedData.map(mapMatchedCompanyToCandlesData);

  chartInstance.setData({ candles });

  // Created a magnet target
  chartInstance.crossToolComponent.setMagnetTarget("OHLC");

  chartInstance.chartComponent.setMainSeries({ candles });

  chartInstance.crossToolComponent.registerCrossToolTypeDrawer(
    "cross-and-labels",
    new CustomCrosstoolDrawer(
      chartInstance.config,
      chartInstance.canvasBoundsContainer,
      chartInstance.chartModel,
      chartInstance.paneManager
    )
  );

  // Handle chart's type
  const inputs = Array.from(
    document.querySelectorAll('input[name="chart-type"]')
  );
  inputs.forEach((input) => {
    input.addEventListener("click", () =>
      chartInstance.chartComponent.setChartType(input.value)
    );
  });
}
