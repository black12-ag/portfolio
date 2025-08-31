// Currency service stub for portfolio - not needed
export const currencyService = {
  getCurrentRate: () => Promise.resolve(1),
  getSupportedCurrencies: () => [],
};

export const liveCurrencyService = {
  getCurrentRate: () => Promise.resolve(1),
  getSupportedCurrencies: () => [],
  convertCurrency: (amount: number) => Promise.resolve(amount),
  getExchangeRates: () => Promise.resolve({}),
  getCacheStatus: () => Promise.resolve({ isValid: true, lastUpdated: new Date() }),
};
