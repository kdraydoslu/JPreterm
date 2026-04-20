/**
 * Market data refresh task
 * Fetches fresh data from Alpha Vantage and updates Redis
 */

import { fetchAllMarketData, fetchStockWatchlist, US_STOCKS, BIST_STOCKS } from "./alpha-vantage";
import { redis } from "./redis";
import scheduler from "./scheduler";

// Function to refresh market data from Alpha Vantage and store in Redis
export async function refreshMarketData(): Promise<void> {
  try {
    console.log("Starting market data refresh from Alpha Vantage...");

    // Check if we already have data in Redis
    const existingData = await redis.get("market_data");

    // If we don't have data, or it's been more than 24 hours since last update
    if (!existingData || shouldRefreshData(existingData as any)) {
      // Fetch fresh data from Alpha Vantage
      const marketData = await fetchAllMarketData();

      // Check if we got enough data
      const totalIndices =
        marketData.americas.length + marketData.emea.length + marketData.asiaPacific.length;

      if (totalIndices < 5) {
        throw new Error("Not enough data received from Alpha Vantage indices");
      }

      console.log("Fetching US stocks...");
      const us_stocks = await fetchStockWatchlist(US_STOCKS);
      console.log("Fetching BIST stocks...");
      const bist_stocks = await fetchStockWatchlist(BIST_STOCKS);

      // Add timestamp to data
      const dataWithTimestamp = {
        ...marketData,
        us_stocks,
        bist_stocks,
        lastUpdated: new Date().toISOString(),
        lastFullRefresh: new Date().toISOString(),
      };

      // Store in Redis with 48-hour expiration (as backup in case scheduler fails)
      await redis.set("market_data", dataWithTimestamp, { ex: 48 * 60 * 60 });

      console.log("Market data successfully refreshed and stored in Redis");
      return;
    }

    console.log("Recent market data found in Redis, skipping refresh");
  } catch (error) {
    console.error("Error refreshing market data:", error);
    throw error;
  }
}

// Helper to determine if we should refresh the data
function shouldRefreshData(data: { lastFullRefresh?: string, bist_stocks?: any[], us_stocks?: any[] }): boolean {
  if (!data?.lastFullRefresh) return true;
  
  // Force a refresh if our new stock arrays are missing in cache or empty
  if (!data?.bist_stocks || data.bist_stocks.length === 0 || !data?.us_stocks || data.us_stocks.length === 0) return true;

  const lastRefresh = new Date(data.lastFullRefresh).getTime();
  const now = Date.now();
  const hoursSinceLastRefresh = (now - lastRefresh) / (1000 * 60 * 60);

  // Refresh if it's been more than 23 hours
  return hoursSinceLastRefresh > 23;
}

// Register the task with the scheduler - refresh once every 24 hours
scheduler.register(
  "market-data-refresh",
  "Alpha Vantage Market Data Refresh",
  24, // Run every 24 hours
  refreshMarketData
);

export default refreshMarketData;
