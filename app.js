import { sampleData } from "./sampleData/data.js";
//main table
const tableHeaders = {
  name: "Name",
  previous: "Previous Close",
  last: "Last",
  percent: "%",
  value: "+/-",
  tradeTime: "Trade Time",
};

const firstTable = document.querySelector("table");
const thead = firstTable.querySelector("thead tr");

Object.values(tableHeaders).forEach((field) => {
  const th = document.createElement("th");
  th.textContent = field;
  thead.appendChild(th);
});

function mainTable(data, headers) {
  const tableBody = document.querySelector("tbody");

  data.forEach((stock) => {
    const row = document.createElement("tr");

    row.addEventListener("click", () => {
      const name = stock.name;
      const symbol = stock.symbol;

      // Store data in local storage
      localStorage.setItem("selectedCompany", JSON.stringify({ name, symbol }));
      window.location.href = "chartPage/chartPage.html";
    });

    Object.keys(headers).forEach((key) => {
      const cell = document.createElement("td");

      if (key === "value" || key === "percent") {
        if (stock[key].includes("+")) {
          cell.style.color = "green";
        } else if (stock[key].includes("-")) {
          cell.style.color = "red";
        }
      }

      cell.textContent = stock[key];
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });
}

mainTable(sampleData, tableHeaders);

// Get biggest gainers and losers

function biggestGainersAndLosers(sampleData) {
  const companyDetails = {};
  const values = sampleData.map((company) => {
    const value = parseFloat(company.value.replace(/[+$]/g, ""));
    companyDetails[value] = company;
    return {
      value,
      change: parseFloat(company.percent.replace(/[%+$]/g, "")),
      company,
    };
  });

  values.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const biggestGainers = values.filter((value) => value.value > 0).slice(0, 5);
  const biggestLosers = values.filter((value) => value.value < 0).slice(0, 5);

  const gainersList = document.querySelector(".gainers-list");
  const losersList = document.querySelector(".losers-list");
  gainersList.innerHTML = "";
  losersList.innerHTML = "";

  biggestGainers.forEach((item) => {
    const company = item.company;
    const listItem = document.createElement("div");
    listItem.classList.add("list");
    listItem.innerHTML = `
          <div class="ticker-symbol">${company.symbol}</div>
          <div class="percent-change gainers-percent">${company.percent.replace(
            /[+$]/g,
            ""
          )}</div>
          <div class="list-name">${company.name}</div>
          <div class="value-change">${company.value.replace(/[+$]/g, "")}</div>
        `;
    gainersList.appendChild(listItem);
  });

  biggestLosers.forEach((item) => {
    const company = item.company;
    const listItem = document.createElement("div");
    listItem.classList.add("list");
    listItem.innerHTML = `
          <div class="ticker-symbol">${company.symbol}</div>
          <div class="percent-change losers-percent">${company.percent}</div>
          <div class="list-name">${company.name}</div>
          <div class="value-change">${company.value.replace(/[-$]/g, "")}</div>
        `;
    losersList.appendChild(listItem);
  });
}

biggestGainersAndLosers(sampleData);
