import { sampleData } from "../sampleData/data.js";
import CustomCrosstoolDrawer from "./drawer.js";
import { generateHistoricalData } from "../sampleData/historyData.js";

const selectedCompany = JSON.parse(localStorage.getItem("selectedCompany"));
const settings = document.querySelector(".settings");

// Save and load data to/from localStorage
const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const loadFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

let historicalData = loadFromLocalStorage("historicalData");

if (!historicalData) {
  historicalData = generateHistoricalData(sampleData, 100);
  saveToLocalStorage("historicalData", historicalData);
}

const matchedCompany = sampleData.find(
  (company) => company.name === selectedCompany.name
);

const matchedCompanyHistoricalData = historicalData.filter(
  (company) => company.name === matchedCompany.name
);

const combinedData = [matchedCompany, ...matchedCompanyHistoricalData];

const newData = combinedData.map((item) => ({
  close: parseFloat(item.close),
  hi: parseFloat(item.hi),
  isVisible: item.isVisible,
  lo: parseFloat(item.lo),
  open: parseFloat(item.open),
  timestamp: item.timestamp,
  volume: parseInt(item.volume, 10),
}));

if (selectedCompany) {
  const stockHistoryName = document.createElement("h1");
  stockHistoryName.classList.add("history-name");
  stockHistoryName.textContent = selectedCompany.name;

  const stockHistoryDetails = document.createElement("div");
  stockHistoryDetails.classList.add("stock-details");

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
      hi: item.hi,
      lo: item.lo,
      open: item.open,
      close: item.close,
      timestamp: item.timestamp,
      volume: item.volume,
      isVisible: item.isVisible,
    };
  }

  const candles = newData.map(mapMatchedCompanyToCandlesData);
  console.log(candles);
  chartInstance.setData({ candles });
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

  // Calculate Heikin-Ashi data
  function calculateHeikinAshi(data) {
    const haData = [];
    let previousHAOpen = data[0].open;
    let previousHAClose = data[0].close;

    for (let i = 0; i < data.length; i++) {
      const { open, hi, lo, close } = data[i];

      const haClose = (open + hi + lo + close) / 4;
      const haOpen = i === 0 ? open : (previousHAOpen + previousHAClose) / 2;
      const haHigh = Math.max(hi, haOpen, haClose);
      const haLow = Math.min(lo, haOpen, haClose);

      haData.push({
        ...data[i],
        open: haOpen,
        hi: haHigh,
        lo: haLow,
        close: haClose,
      });

      previousHAOpen = haOpen;
      previousHAClose = haClose;
    }

    return haData;
  }

  // Handle chart type selection
  const inputs = Array.from(
    document.querySelectorAll('input[name="chart-type"]')
  );

  inputs.forEach((input) => {
    input.addEventListener("click", () => {
      if (input.value === "heikin-ashi") {
        const haData = calculateHeikinAshi(candles);
        chartInstance.setData({ candles: haData });
        chartInstance.chartComponent.setMainSeries({ candles: haData });
      } else {
        chartInstance.setData({ candles });
        chartInstance.chartComponent.setMainSeries({ candles });
      }
      chartInstance.chartComponent.setChartType(input.value);
    });
  });
}
