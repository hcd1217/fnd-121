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

export function getData(account: Account) {
  return axios.get(`/api/data/${account.code}`).then((res) => {
    return (res.data || []) as AccountData[];
  });
}
