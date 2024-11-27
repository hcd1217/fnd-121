import _axios from "axios";

export type Account = {
  name: string;
  code: string;
};

export type AccountData = [number, number, number, number, number];

export type Performance = {
  initValue: number;
  pnl: number;
  pnlRatio: number;
  winRate: number;
  maxDrawdown: number;
  dailyMaxDrawdownRatio: number;
  recoverDays: number;
  maxDDRatio: number;
  turnoverRatio: number;
  profitVsLossRatio: number;
  sharpRatio: number;
  annualizedSharpRatio: number;
  maxLeverage: number;
};

const axios = _axios.create({
  baseURL: import.meta.env.APP_API_URL,
  headers: {
    "Content-type": "application/json",
    "X-Token": sessionStorage.__X_TOKEN__ || "-",
  },
});

export function getAccounts() {
  return axios
    .get("/api/all")
    .then((res) => {
      return (res?.data?.accounts || []) as Account[];
    })
    .catch(() => {
      delete sessionStorage.__X_TOKEN__;
      alert("Invalid token, please login again.");
      setTimeout(() => {
        window.location.reload();
      }, 300);
      return Promise.reject("Invalid token");
    });
}

const data: Record<string, AccountData[]> = {};

export function getData(code: string) {
  if (data[code]) {
    return Promise.resolve(data[code]);
  }

  return axios.get(`/api/data/${code}`).then((res) => {
    data[code] = (res.data || []) as AccountData[];
    return data[code];
  });
}
