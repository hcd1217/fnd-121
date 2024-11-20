import _axios from "axios";

export type Account = {
  name: string;
  apiKey: string;
  code: string;
  status: "valid" | "invalid" | "unverified";
};

export type AccountData = [number, number, number, number];

export type Performance = {
  initValue: number;
  pnl: number;
  pnlRatio: number;
  winRate: number;
  maxDrawdown: number;
  recoverDays: number;
  maxDDRatio: number;
  sharpRatio: number;
  turnoverRatio: number;
  profitVsLossRatio: number;
  maxLeverage: number;
};

const axios = _axios.create({
  baseURL: import.meta.env.APP_API_URL || "https://fund-api.cryptocopyinvest.com",
  headers: {
    "Content-type": "application/json",
    "X-Token": localStorage.__X_TOKEN__ || "-",
  },
});

export function getAccounts() {
  const debug = false;
  if (debug) {
    return Promise.resolve([
      {
        name: "Account 1",
        apiKey: "123************",
        status: "valid",
      },
      {
        name: "Account 2",
        apiKey: "456************",
        status: "invalid",
      },
    ] as Account[]);
  }
  return axios.get("/api/all").then((res) => {
    return (res?.data?.accounts || []) as Account[];
  });
}

export function getData(account: Account) {
  return axios.get(`/api/data/${account.code}`).then((res) => {
    return (res.data || []) as AccountData[];
  });
}
