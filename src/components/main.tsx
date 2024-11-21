import {
  Box,
  Button,
  Divider,
  Flex,
  LoadingOverlay,
  Select,
  Text,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
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
    });
  }, []);

  useEffect(() => {
    if (selectedAccount?.code) {
      setLoading(true);
      getData(selectedAccount)
        .then((data) => {
          data.sort((a, b) => a[0] - b[0]);
          setData(data);
          const from = new Date(data[0][0]);
          const to = new Date(data[data.length - 1][0]);
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
                account && setSelectedAccount(account);
              }}
            />
            <Button
              onClick={() =>
                selectedAccount &&
                _handleExportPDF(
                  exportRef,
                  selectedAccount.name,
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
          <Text fz="h3" fw="bold" c="primary.5">
            {selectedAccount.name}
          </Text>
        ) : (
          <div>{""}</div>
        )}
        {performance && (
          <Flex>
            <Box flex={3}>
              <PerformanceComponent
                performance={performance}
                accountName={selectedAccount?.name}
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
      recoverDays: 0,
      maxDDRatio: 0,
      sharpRatio: 0,
      turnoverRatio: 0,
      profitVsLossRatio: 0,
      maxLeverage: 0,
    };
  }
  const total = data.length;
  const dayZeroEquity = data[0][2];
  const finalEquity = data[total - 1][2];
  let maxDrawdown = 0,
    maxDDRatio = 0,
    maxLeverage = 0,
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
  };
  // date, price, equity, position
  data.forEach(([ts, , equity, position], idx) => {
    if (idx > 0) {
      if (equity > storages.equity) {
        storages.win++;
      } else {
        storages.lose++;
      }
    }
    const dd = storages.maxEquity - equity;
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

    const ratio = (equity - storages.equity) / storages.equity;
    storages.equity = equity;
    storages.maxEquity = Math.max(storages.maxEquity, equity);
    storages.accRatio += ratio;
    storages.maxRatio = Math.max(
      storages.maxRatio,
      storages.accRatio,
    );
    const ratioDD = storages.maxRatio - storages.accRatio;
    maxDDRatio = Math.max(maxDDRatio, ratioDD);
    maxLeverage = Math.max(maxLeverage, Math.abs(position / equity));

    return idx > 0 ? ratio : 0;
  });
  let yieldRate = 0;
  _log(storages.pfRates);
  if (storages.pfRates.length) {
    const avgPfRate =
      storages.pfRates.reduce((acc, cur) => acc + cur, 0) /
      storages.pfRates.length;
    const diffSqr = storages.pfRates.map(
      (rate) => (rate - avgPfRate) ** 2,
    );
    const avgDiffSqr =
      diffSqr.reduce((acc, cur) => acc + cur, 0) / diffSqr.length;
    yieldRate = Math.sqrt(avgDiffSqr);
    _log(avgPfRate, yieldRate);
  }

  const riskFreeRate = 0;
  const pnlRatio = (finalEquity - dayZeroEquity) / dayZeroEquity;
  return {
    initValue: dayZeroEquity,
    pnl: finalEquity - dayZeroEquity,
    pnlRatio: _round(pnlRatio, 4),
    winRate: _round(storages.win / (storages.win + storages.lose), 4),
    maxDrawdown,
    recoverDays,
    maxDDRatio: _round(maxDDRatio, 4),
    sharpRatio: _round((pnlRatio - riskFreeRate) / yieldRate, 3),
    turnoverRatio: 0, // TODO
    profitVsLossRatio: 0, // TODO
    maxLeverage: _round(maxLeverage, 2),
  };
}
