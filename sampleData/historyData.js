export const generateHistoricalData = (entryData, numEntries) => {
  return entryData.flatMap((stock) => {
    const historicalEntries = [];
    let currentTimestamp = stock.timestamp;

    let previousValue = parseFloat(stock.last);

    for (let i = 0; i < numEntries; i++) {
      currentTimestamp -= 86400000; //reduce on one day

      // Generate random values
      const open = previousValue + (Math.random() - 0.5) * 20;
      const close = open + (Math.random() - 0.5) * 20;
      const hi = Math.max(open, close) + Math.random() * 10;
      const lo = Math.min(open, close) - Math.random() * 10;
      const volume = Math.round(Math.random() * 100000);
      const value = (close - open).toFixed(2);
      const percent = (((close - open) / open) * 100).toFixed(2);

      // Create a date object for trade time
      const tradeDate = new Date(currentTimestamp);
      const formattedTime = `${tradeDate.toLocaleDateString()} ${tradeDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${tradeDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${tradeDate
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;

      historicalEntries.push({
        name: stock.name,
        symbol: stock.symbol,
        previous: previousValue.toFixed(2),
        last: close.toFixed(2),
        percent: `${percent}%`,
        value: value,
        tradeTime: formattedTime,
        close: close.toFixed(2),
        hi: hi.toFixed(2),
        isVisible: true,
        lo: lo.toFixed(2),
        open: open.toFixed(2),
        timestamp: currentTimestamp,
        volume: volume,
      });

      // Update previousValue for next iteration
      previousValue = close;
    }

    return historicalEntries;
  });
};
