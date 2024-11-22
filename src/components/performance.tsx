import {
  Card,
  Container,
  Grid,
  Progress,
  RingProgress,
  Table,
  Text,
} from "@mantine/core";
import { useState } from "react";
import { Performance as PerformanceType } from "../services/api";

type PerformanceProps = {
  performance: PerformanceType;
};

const LABELS: Record<string, string> = {
  initValue: "Initial", // 開始金額
  pnl: "PnL", // 損益
  pnlRatio: "PnL Ratio", // 損益率(%)
  winRate: "Win Rate (Days)", // 勝率（日）
  maxDrawdown: "Max Drawdown", // MAXドローダウン
  recoverDays: "Recover (Days)", // ドローダウン回復までの日数
  maxDDRatio: "Max Drawdown (Ratio)", // MAXドローダウン（日）
  sharpRatio: "Sharp Ratio", // シャープレシオ
  // turnoverRatio: "Turnover Ratio", // 回転率
  // profitVsLossRatio: "Profit/Loss Ratio", // Profit/Loss Ratio
  maxLeverage: "Max Leverage", // 最大レバレッジ
};

const OPTIONS = [
  { label: "Table View", value: "Table" },
  { label: "Grid View", value: "Grid" },
];

export default function Performance({
  performance,
}: {
  performance: PerformanceType;
  accountName?: string;
}) {
  const [option] = useState(OPTIONS[0].value);

  return (
    <Container>
      {/* Header */}
      {/* <Flex mb="md" justify={"space-between"}>
        <Select
          w="16rem"
          placeholder="Select"
          data={options}
          value={option}
          onChange={(v) => setOption(v || "")}
        />
      </Flex> */}
      {option === "Table" ? (
        <TableComponent performance={performance} />
      ) : (
        <GridComponent performance={performance} />
      )}
    </Container>
  );
}

function GridComponent({ performance }: PerformanceProps) {
  const {
    initValue,
    pnl,
    pnlRatio,
    profitVsLossRatio,
    turnoverRatio,
    maxLeverage,
    maxDrawdown,
    recoverDays,
    sharpRatio,
    maxDDRatio,
  } = performance;

  return (
    <Grid
      grow
      gutter="md"
      bg={"var(--mantine-color-gray-0"}
      p={"1rem"}
    >
      {/* Initial Value */}
      <Grid.Col span={12}>
        <Card shadow="md" padding="lg" h={"100%"} radius={"md"}>
          <Text fw={500} size="lg" mb="xs">
            Value
          </Text>
          <Text size="xl" ta="center" fw={700} color="blue">
            ${initValue.toLocaleString()}
          </Text>
        </Card>
      </Grid.Col>

      {/* PnL */}
      <Grid.Col span={4}>
        <Card shadow="md" padding="lg" h={"100%"} radius={"md"}>
          <Text fw={500} size="lg" mb="xs">
            Profit and Loss
          </Text>
          <Text
            size="xl"
            ta="center"
            fw={700}
            c={pnl > 0 ? "green" : "red"}
          >
            ${pnl.toLocaleString()}
          </Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={4}>
        <Card shadow="md" padding="lg" h={"100%"} radius={"md"}>
          <Text fw={500} size="lg" mb="xs">
            Profit and Loss Ratio
          </Text>

          <Text size="xl" ta="center" fw={700}>
            {pnlRatio.toFixed(2)}%
          </Text>
          <Progress
            value={pnlRatio * 100}
            color={pnlRatio > 0 ? "green" : "red"}
            size="md"
            radius="md"
          />
        </Card>
      </Grid.Col>

      {/* Profit vs Loss Ratio */}
      <Grid.Col span={4}>
        <Card shadow="md" padding="lg" h={"100%"} radius={"md"}>
          <Text fw={500} size="lg" mb="xs">
            Profit vs Loss Ratio
          </Text>
          <Text size="xl" ta="center" fw={700}>
            {profitVsLossRatio.toFixed(2)}%
          </Text>
        </Card>
      </Grid.Col>

      {/* Additional Metrics */}

      {/* Turnover Ratio */}
      <Grid.Col span={4}>
        <Card shadow="md" padding="lg" h={"100%"} radius={"md"}>
          <Text fw={500} size="lg" mb="xs">
            Turnover Ratio
          </Text>
          <RingProgress
            sections={[{ value: turnoverRatio * 10, color: "cyan" }]}
            label={
              <Text size="lg" ta="center" fw={700}>
                {turnoverRatio.toFixed(2)}
              </Text>
            }
          />
        </Card>
      </Grid.Col>

      {/* Maximum Leverage */}
      <Grid.Col span={4}>
        <Card shadow="md" padding="lg" h={"100%"} radius={"md"}>
          <Text fw={500} size="lg" mb="xs">
            Maximum Leverage
          </Text>
          <RingProgress
            sections={[
              {
                value: Math.min(maxLeverage * 10, 100),
                color: maxLeverage > 5 ? "red" : "green",
              },
            ]}
            label={
              <Text size="lg" ta="center" fw={700}>
                {maxLeverage.toFixed(2)}x
              </Text>
            }
          />
        </Card>
      </Grid.Col>

      {/* Sharp Ratio */}
      <Grid.Col span={4}>
        <Card shadow="md" padding="lg" h={"100%"} radius={"md"}>
          <Text fw={500} size="lg" mb="xs">
            Sharp Ratio
          </Text>
          <RingProgress
            sections={[
              {
                value: sharpRatio * 50,
                color: sharpRatio > 0.5 ? "green" : "orange",
              },
            ]}
            label={
              <Text size="lg" ta="center" fw={700}>
                {sharpRatio.toFixed(2)}%
              </Text>
            }
          />
        </Card>
      </Grid.Col>

      {/* Risk Metrics */}

      <Grid.Col span={4}>
        <Card shadow="md" padding="lg" h={"100%"} radius={"md"}>
          <Text fw={500} size="lg" mb="xs">
            Max Drawdown
          </Text>
          <Text size="xl" ta="center" fw={700} color="red">
            ${maxDrawdown.toLocaleString()}
          </Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={4}>
        <Card shadow="md" padding="lg" h={"100%"} radius={"md"}>
          <Text fw={500} size="lg" mb="xs">
            Days to Recover
          </Text>
          <Text size="xl" ta="center" fw={700}>
            {recoverDays} days
          </Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={4}>
        <Card shadow="md" padding="lg" h={"100%"} radius={"md"}>
          <Text fw={500} size="lg" mb="xs">
            Max Drawdown Days
          </Text>
          <Text size="xl" ta="center" fw={700} color="green">
            {maxDDRatio}
          </Text>
        </Card>
      </Grid.Col>
    </Grid>
  );
}

function TableComponent({ performance }: PerformanceProps) {
  return (
    <Table verticalSpacing="md">
      <Table.Tbody>
        {Object.entries(performance).map(([key, value]) => {
          if (!LABELS[key]) {
            return <></>;
          }
          return (
            <Table.Tr key={key} bg={"var(--mantine-color-gray-0"}>
              <Table.Td fw={600} c={"#000"} p="xs">
                {LABELS[key]}
              </Table.Td>
              <Table.Td
                fw={600}
                c={"#000"}
                py="xs"
                px="lg"
                align="right"
              >
                {_value(key, value)}
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}

function _value(key: string, value: number, base = "USDT") {
  switch (key) {
    case "initValue":
      return `${value.toLocaleString()} ${base}`;
    case "pnl":
      return `${value.toLocaleString()} ${base}`;
    case "pnlRatio":
      return `${(100 * value).toLocaleString()}%`;
    case "winRate":
      return `${(100 * value).toLocaleString()}%`;
    case "maxDrawdown":
      return `${value.toLocaleString()} ${base}`;
    case "recoverDays":
      return value ? `${value.toLocaleString()} days` : "-";
    case "maxDDRatio":
      return `${(100 * value).toLocaleString()}%`;
    case "sharpRatio":
      return value ? `${value.toLocaleString()}` : "-";
    case "turnoverRatio":
      return value ? `${value.toLocaleString()}%` : "-";
    case "profitVsLossRatio":
      return value ? `${value.toLocaleString()}%` : "-";
    case "maxLeverage":
      return value ? `${value.toLocaleString()}x` : "-";
    default:
      return "-";
  }
}
