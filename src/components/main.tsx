import {
  Box,
  Button,
  Divider,
  Flex,
  LoadingOverlay,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconDeviceFloppy } from "@tabler/icons-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Account,
  AccountData,
  getAccounts,
  getData,
  Performance,
} from "../services/api";
import Chart from "./chart";
import PerformanceComponent from "./performance";

export default function Main() {
  const [range, setRange] = useState<[Date, Date] | null>(null);
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<Account | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<AccountData[]>([]);
  const [performance, setPerformance] = useState<Performance | null>(
    null,
  );
  const [editMode, setEditMode] = useState(false);
  const [fundName, setFundName] = useState("");

  const filteredData = useMemo(() => {
    if (!from || !to) {
      return data;
    }
    const min = from.getTime() - 1;
    const max = to.getTime() + 1;
    return data.filter((el) => el[0] >= min && el[0] <= max);
  }, [data, from, to]);

  useEffect(() => {
    setPerformance(_eval(filteredData));
  }, [filteredData, data]);

  useEffect(() => {
    getAccounts().then((accounts) => {
      setAccounts(accounts);
      setSelectedAccount(accounts[0]);
      setFundName(accounts[0].name);
    });
  }, []);

  useEffect(() => {
    if (selectedAccount?.code) {
      setLoading(true);
      getData(selectedAccount)
        .then((data) => {
          const ONE_DAY = 24 * 60 * 60 * 1000;
          data.sort((a, b) => a[0] - b[0]);
          setData(data);
          const from = new Date(data[0][0]);
          const to = new Date(
            Math.min(data[data.length - 1][0], Date.now() - ONE_DAY),
          );
          setFrom(from);
          setTo(to);
          setRange([from, to] as [Date, Date]);
          setTimeout(() => setLoading(false), 1000);
        })
        .catch(() => setLoading(false));
    }
  }, [selectedAccount]);

  return (
    <Box
      style={{
        flexGrow: 1,
        color: "var(--mantine-color-gray-3)",
      }}
      p="xs"
    >
      <LoadingOverlay visible={loading} />
      <Flex w="100%" justify="space-between" align="center">
        {selectedAccount ? (
          <Text fz="h2" fw="bold" c="primary.5">
            Fund Management
          </Text>
        ) : (
          <div>{""}</div>
        )}
        <Flex align="center" gap="xs">
          <DatePickerInput
            minDate={range?.[0]}
            maxDate={to || range?.[1]}
            value={from}
            onChange={(date) => setFrom(date)}
            w={"10rem"}
          />
          <Text mx="xs" c="primary.5">
            -
          </Text>
          <DatePickerInput
            minDate={from || range?.[0]}
            maxDate={range?.[1]}
            value={to}
            onChange={(date) => setTo(date)}
            w={"10rem"}
          />
          <Divider orientation="vertical" />
          <Flex gap={10} key={accounts.length}>
            <Select
              w="20rem"
              placeholder="Select account"
              data={accounts.map((a) => ({
                value: a.code,
                label: a.name,
              }))}
              defaultValue={selectedAccount?.code}
              onChange={(value) => {
                const account = value
                  ? accounts.find((a) => a.code === value)
                  : undefined;
                if (account) {
                  setSelectedAccount(account);
                  setFundName(account.name);
                }
              }}
            />
            <Button
              onClick={() =>
                selectedAccount &&
                _handleExportPDF(
                  exportRef,
                  fundName,
                  _formatDate(filteredData[0][0]),
                  _formatDate(
                    filteredData[filteredData.length - 1][0],
                  ),
                )
              }
            >
              Export
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <Divider my="xs" color="gray.3" />

      <Box ref={exportRef}>
        {selectedAccount ? (
          editMode ? (
            <TextInput
              w="20rem"
              m="xs"
              value={fundName}
              onChange={(e) => setFundName(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditMode(false);
                }
              }}
              rightSection={
                <IconDeviceFloppy
                  size={20}
                  style={{
                    color: "var(--mantine-color-primary-3)",
                    cursor: "pointer",
                  }}
                  onClick={() => setEditMode(false)}
                />
              }
            />
          ) : (
            <Text
              m="xs"
              fz="h3"
              fw="bold"
              c="primary.5"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setEditMode(true);
              }}
            >
              {fundName}
            </Text>
          )
        ) : (
          <div>{""}</div>
        )}
        {performance && (
          <Flex>
            <Box flex={3}>
              <PerformanceComponent
                performance={performance}
                accountName={fundName}
              />
            </Box>
            <Box p="xs" flex={7} bd={"1px solid"}>
              <Chart data={filteredData} />
            </Box>
          </Flex>
        )}
      </Box>
      <Box bg="green.1"></Box>
    </Box>
  );
}

async function _handleExportPDF(
  exportRef: React.RefObject<HTMLDivElement>,
  name: string,
  from: string,
  to: string,
) {
  if (!exportRef.current) {
    return;
  }

  const clonedNode = exportRef.current.cloneNode(true) as HTMLElement;
  clonedNode.style.gap = "20px";
  clonedNode.style.position = "absolute";
  clonedNode.style.padding = "30px";
  document.body.appendChild(clonedNode);
  const canvas = await html2canvas(clonedNode, { scale: 2 });

  document.body.removeChild(clonedNode);

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "letter");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

  if (pdf.internal.pageSize.height < pdfHeight) {
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  }

  pdf.save(
    `${name.replace(
      /\s/g,
      "_",
    )}_Performance_Report_${from}_${to}.pdf`,
  );
}

function _formatDate(ts: number) {
  const date = new Date(ts);
  return `${date.getFullYear()}${(1 + date.getMonth())
    .toString()
    .padStart(2, "0")}`;
}

function _round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function _log(...args: unknown[]) {
  if (window.location.href.includes("localhost")) {
    console.log(args); // eslint-disable-line no-console
  }
}

function _eval(data: AccountData[]): Performance {
  if (!data.length) {
    return {
      initValue: 0,
      pnl: 0,
      pnlRatio: 0,
      winRate: 0,
      maxDrawdown: 0,
      dailyMaxDrawdownRatio: 0,
      recoverDays: 0,
      maxDDRatio: 0,
      turnoverRatio: 0,
      profitVsLossRatio: 0,
      sharpRatio: 0,
      annualizedSharpRatio: 0,
      maxLeverage: 0,
    };
  }
  const total = data.length;
  const dayZeroEquity = data[0][2];
  const finalEquity = data[total - 1][2];
  let maxDrawdown = 0,
    maxDDRatio = 0,
    maxLeverage = 0,
    dailyMaxDrawdownRatio = 0,
    recoverDays = 0;
  const storages = {
    win: 0,
    lose: 0,
    month: new Date(data[0][0]).getMonth(),
    beginOfMonthEquity: dayZeroEquity,
    pfRates: [] as number[],
    equity: dayZeroEquity,
    maxEquity: dayZeroEquity,
    recover: false,
    recoverDays: 0,
    maxRatio: 0,
    accRatio: 0,
    accDeposit: 0,
  };
  // date, price, equity, position
  data.forEach(([ts, , equity, position, deposit], idx) => {
    storages.accDeposit += deposit || 0;
    if (isNaN(storages.accDeposit)) {
      _log("accDeposit", storages.accDeposit, deposit);
    }
    if (idx > 0) {
      if (equity > storages.equity) {
        storages.win++;
      } else {
        storages.lose++;
      }
    }
    const dd = storages.maxEquity - equity + storages.accDeposit;
    if (dd > 0) {
      storages.recover = false;
      storages.recoverDays++;
    } else {
      storages.recover = true;
      recoverDays = Math.max(recoverDays, storages.recoverDays);
      storages.recoverDays = 0;
    }
    maxDrawdown = Math.max(maxDrawdown, dd);

    const month = new Date(ts).getMonth();
    if (month !== storages.month || total - 1 === idx) {
      const e = total - 1 === idx ? equity : storages.equity;
      const prRate =
        (e - storages.beginOfMonthEquity) /
        storages.beginOfMonthEquity;
      storages.pfRates.push(prRate);
      storages.month = month;
      storages.beginOfMonthEquity = storages.equity;
    }

    const ratio =
      (equity - deposit - storages.equity) / storages.equity;
    storages.equity = equity;
    storages.maxEquity = Math.max(storages.maxEquity, equity);
    storages.accRatio += ratio;
    storages.maxRatio = Math.max(
      storages.maxRatio,
      storages.accRatio,
    );
    const ratioDD = storages.maxRatio - storages.accRatio;

    maxDDRatio = Math.max(maxDDRatio, ratioDD);
    dailyMaxDrawdownRatio = Math.max(dailyMaxDrawdownRatio, ratio);
    maxLeverage = Math.max(maxLeverage, Math.abs(position / equity));
  });

  const riskFreeRate = 0;
  const initValue = dayZeroEquity;
  const pnl = finalEquity - dayZeroEquity - storages.accDeposit;
  const pnlRatio = pnl / initValue;
  let sharpRatio = 0,
    annualizedSharpRatio = 0;
  if (storages.pfRates.length) {
    _log(
      "pfRates",
      storages.pfRates.map((rate) => _round(rate * 100, 2)),
    );
    const avgPfRate =
      storages.pfRates.reduce((acc, cur) => acc + cur, 0) /
      storages.pfRates.length;
    _log("avgPfRate", _round(avgPfRate * 100, 2));
    const diffSqr = storages.pfRates.map(
      (rate) => (rate - avgPfRate) ** 2,
    );
    const variance =
      diffSqr.reduce((acc, cur) => acc + cur, 0) /
      (diffSqr.length - 1);
    _log("variance", variance);

    const annualizedPfRate = (1 + avgPfRate) ** 12;
    _log("annualizedPfRate", _round(annualizedPfRate * 100, 2));
    const volatility = Math.sqrt(variance);
    const annualizedVolatility = volatility * Math.sqrt(12);
    sharpRatio = (pnlRatio - riskFreeRate) / volatility;
    annualizedSharpRatio =
      (annualizedPfRate - riskFreeRate) / annualizedVolatility;
  }

  return {
    initValue,
    pnl,
    pnlRatio: _round(pnlRatio, 4),
    winRate: _round(storages.win / (storages.win + storages.lose), 4),
    maxDrawdown,
    dailyMaxDrawdownRatio: _round(dailyMaxDrawdownRatio, 4),
    recoverDays,
    maxDDRatio: _round(maxDDRatio, 4),
    turnoverRatio: 0, // TODO
    profitVsLossRatio: 0, // TODO
    sharpRatio,
    annualizedSharpRatio,
    maxLeverage: _round(maxLeverage, 2),
  };
}
