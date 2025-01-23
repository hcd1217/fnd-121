import {
  Box, Button,
  Divider,
  Flex,
  LoadingOverlay,
  MultiSelect,
  Select,
  Text,
  TextInput
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconDeviceFloppy } from "@tabler/icons-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Account,
  AccountData,
  getAccounts,
  getData,
  Performance,
} from "../../services/api";
import Chart from "../chart";
import PerformanceComponent from "../performance";


const ONE_DAY = 24 * 60 * 60 * 1000;

export default function Main() {
  const [range, setRange] = useState<[Date, Date] | null>(null);
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<Account | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Record<string, AccountData[]>>({});
  const [isMultiple] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);
  const [fundName, setFundName] = useState("");
  const [mode, setMode] = useState<"web" | "pdf">("web");

  const { performance, fundValues } = useMemo(() => {
    if (codes.length < 1) {
      const [performance, fundValues] = _eval([]);
      return { performance, fundValues };
    }
    if (!from || !to) {
      const [performance, fundValues] = _eval(
        codes.map((code) => data[code] || []),
      );
      return { performance, fundValues };
    }
    const min = from.getTime() - 1;
    const max = to.getTime() + 1;
    const [performance, fundValues] = _eval(
      codes.map(
        (code) =>
          data[code]?.filter((el) => el[0] >= min && el[0] <= max) ||
          [],
      ),
    );
    return { performance, fundValues };
  }, [data, from, to, codes]);

  useEffect(() => {
    getAccounts().then((accounts) => {
      setCodes(accounts[0] ? [accounts[0].code] : []);
      setAccounts(accounts);
      setSelectedAccount(accounts[0]);
      setFundName(accounts[0].name);
    });
  }, []);

  const updateFromAndTo = useCallback((data: AccountData[]) => {
    const from = new Date(data[0][0]);
    const to = new Date(
      ONE_DAY + Math.min(
        data[data.length - 1][0],
        Date.now() - ONE_DAY,
      ),
    );
    setFrom(from);
    setTo(to);
    setRange([from, to] as [Date, Date]);
  }, []);

  useEffect(() => {
    const sortCode = codes[0];
    _log("sortCode", sortCode);
    if (!sortCode) {
      return;
    }
    for (const code of codes) {
      console.log("check code", code); // eslint-disable-line no-console
      if (!data[code]) {
        setLoading(true);
        getData(code).then((data) => {
          data.sort((a, b) => a[0] - b[0]);
          setData((prev) => {
            prev[code] = data;
            return prev;
          });
          if (sortCode === code) {
            updateFromAndTo(data);
          }
          setLoading(false);
        }).catch(() => setLoading(false));
      } else if (sortCode === code) {
        updateFromAndTo(data[code]);
      }
    }
  }, [codes, data, updateFromAndTo]);

  return (
    <Box
      style={{
        flexGrow: 1,
        color: "var(--mantine-color-gray-3)",
      }}
      p="xs"
    >
      <LoadingOverlay visible={loading || mode === "pdf"} />
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
            {isMultiple ? (
              <MultiSelect
                maxDropdownHeight={700}
                clearable
                searchable
                onChange={(codes) => {
                  setCodes([...codes]);
                  const account = codes[0]
                    ? accounts.find((a) => a.code === codes[0])
                    : undefined;
                  if (account) {
                    setSelectedAccount(account);
                    setFundName(account.name);
                  }
                }}
                w="20rem"
                data={accounts.map((a) => ({
                  value: a.code,
                  label: a.name,
                }))}
                defaultValue={
                  selectedAccount?.code ? [selectedAccount?.code] : []
                }
              />
            ) : (
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
            )}
            <Button
              onClick={() => {
                if (selectedAccount && from && to) {
                  setMode("pdf");
                  setTimeout(() => {
                    _handleExportPDF(
                      exportRef,
                      fundName,
                      _formatDate(from.getTime()),
                      _formatDate(to.getTime()),
                    );
                    setMode("web");
                  }, 100);
                }
              }}
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
            {mode === "web" ? (
              <>
                <Box flex={3}>
                  <PerformanceComponent
                    performance={performance}
                    accountName={fundName}
                  />
                </Box>
                <Box p="xs" flex={7} bd={"1px solid"}>
                  <Chart data={fundValues} />
                </Box>
              </>
            ) : (
              <Flex justify="center" w="100%">
                <Box w="60vw">
                  <Chart data={fundValues} />
                </Box>
              </Flex>
            )}
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function _sum(values: number[]) {
  return values.reduce((acc, cur) => acc + cur, 0);
}

function _log(...args: unknown[]) {
  if (window.location.href.includes("localhost")) {
    console.log(...args); // eslint-disable-line no-console
  }
}

function _eval(lists: AccountData[][]): [Performance, number[][]] {
  const length = Math.max(...lists.map((list) => list.length));

  if (!length) {
    return [
      {
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
      },
      [],
    ];
  }

  let from = Date.now() + 1;
  let to = 0;
  lists.forEach((list) =>
    list.forEach(([ts]) => {
      from = Math.min(from, ts);
      to = Math.max(to, ts);
    }),
  );

  const ONE_DAY = 24 * 60 * 60 * 1000;
  const maps = lists.map((list) => {
    return list
      .map(([ts, price, equity, position, deposit]) => {
        return [ts, { price, equity, position, deposit }] as [
          number,
          {
            price: number;
            equity: number;
            position: number;
            deposit: number;
          },
        ];
      })
      .reduce((acc, [ts, data]) => {
        acc[ts] = data;
        return acc;
      }, {} as Record<number, { price: number; equity: number; position: number; deposit: number }>);
  });
  let totalEquity = _sum(maps.map((map) => map[from]?.equity || 0));
  const mainIdx = maps.findIndex((map) => Boolean(map[from]));
  const mainEquity = maps[mainIdx]?.[from]?.equity || 0;
  let mainRatio = mainEquity / totalEquity;
  const dayZeroEquity = totalEquity * mainRatio;
  const fundValues = [[from, dayZeroEquity]];
  const total = 1 + (to - from) / ONE_DAY;
  let maxLeverage = 0;
  const prevEquity = maps.map((map) => map[from]?.equity || 0);
  for (let i = 1; i < total; i++) {
    const ts = from + i * ONE_DAY;
    const deposit = _sum(maps.map((map) => map[ts]?.deposit || 0));
    const position = _sum(maps.map((map) => map[ts]?.position || 0));
    if (deposit) {
      mainRatio = fundValues[i - 1][1] / (totalEquity + deposit);
    }
    totalEquity = _sum(
      maps.map((map, idx) => map[ts]?.equity || prevEquity[idx] || 0),
    );
    fundValues.push([ts, totalEquity * mainRatio]);
    maxLeverage = Math.max(
      maxLeverage,
      Math.abs(position / totalEquity),
    );
    // _log(i, totalEquity);
  }
  // fundValues.map(([, v], idx) => _log(idx + ":", _round(v, 3)));
  const initValue = dayZeroEquity;
  // _log("initValue:", _round(initValue, 2));
  const finalEquity = fundValues[fundValues.length - 1][1];
  const pnl = finalEquity - dayZeroEquity;
  const pnlRatio = pnl / initValue;
  // _log("pnlRatio:", _round(100 * pnlRatio, 2));

  let prev = dayZeroEquity;
  const wins = fundValues.map((v) => {
    const isWin = v[1] > prev;
    prev = v[1];
    return isWin ? 1 : 0;
  });
  const totalWin = _sum(wins);
  const winRate = totalWin / fundValues.length;
  let recoverDays = 0;
  const storages = {
    maxDDRatio: 0,
    accRatio: 0,
    dailyMaxDrawdownRatio: 0,
    equity: dayZeroEquity,
    beginOfMonthEquity: dayZeroEquity,
    month: new Date(from).getMonth(),
    pfRates: [] as number[],
    maxRatio: 0,
    recover: false,
    recoverDays: 0,
  };

  fundValues.forEach(([ts, equity], idx) => {
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
    storages.accRatio += ratio;
    storages.maxRatio = Math.max(
      storages.maxRatio,
      storages.accRatio,
    );
    const ratioDD = storages.maxRatio - storages.accRatio;
    storages.maxDDRatio = Math.max(storages.maxDDRatio, ratioDD);
    storages.dailyMaxDrawdownRatio = Math.max(
      storages.dailyMaxDrawdownRatio,
      ratio,
    );
    if (ratioDD > 0) {
      storages.recover = false;
      storages.recoverDays++;
    } else {
      storages.recover = true;
      recoverDays = Math.max(recoverDays, storages.recoverDays);
      storages.recoverDays = 0;
    }
  });

  const riskFreeRate = 0;
  let sharpRatio = 0,
    annualizedSharpRatio = 0;
  if (storages.pfRates.length > 1) {
    // _log(
    //   "pfRates",
    //   storages.pfRates.map((rate) => _round(rate * 100, 2)),
    // );
    const avgPfRate =
      storages.pfRates.reduce((acc, cur) => acc + cur, 0) /
      storages.pfRates.length;
    // _log("avgPfRate", _round(avgPfRate * 100, 2));
    const diffSqr = storages.pfRates.map(
      (rate) => (rate - avgPfRate) ** 2,
    );
    const variance =
      diffSqr.reduce((acc, cur) => acc + cur, 0) /
      (diffSqr.length - 1);
    // _log("variance", variance);

    const annualizedPfRate = (1 + avgPfRate) ** 12;
    // _log("annualizedPfRate", _round(annualizedPfRate * 100, 2));
    const volatility = Math.sqrt(variance);
    const annualizedVolatility = volatility * Math.sqrt(12);
    sharpRatio = (pnlRatio - riskFreeRate) / volatility;
    annualizedSharpRatio =
      (annualizedPfRate - riskFreeRate) / annualizedVolatility;
  }
  return [
    {
      initValue,
      pnl,
      pnlRatio,
      winRate,
      maxDrawdown: 0, // TODO
      dailyMaxDrawdownRatio: storages.dailyMaxDrawdownRatio,
      recoverDays,
      maxDDRatio: storages.maxDDRatio,
      turnoverRatio: 0, // TODO
      profitVsLossRatio: 0, // TODO
      sharpRatio,
      annualizedSharpRatio,
      maxLeverage: maxLeverage,
    },
    fundValues,
  ];
}
