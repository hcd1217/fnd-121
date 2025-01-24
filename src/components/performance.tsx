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
  pnlRatio: "PnL Ratio",
  winRate: "Win Rate (Days)",
  maxDDRatio: "Max Drawdown (Ratio)",
  dailyMaxDrawdownRatio: "Daily Max Drawdown (Ratio)",
  recoverDays: "Recover (Days)",
  // annualizedSharpRatio: "Sharp Ratio",
  maxLeverage: "Max Leverage",
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
        {Object.entries(LABELS).map(([key, label]) => {
          const value = performance[key as keyof PerformanceType];
          return (
            <Table.Tr key={key} bg={"var(--mantine-color-gray-0"}>
              <Table.Td fw={600} c={"#000"} p="xs">
                {label}
              </Table.Td>
              <Table.Td
                fw={600}
                c={"#000"}
                py="xs"
                px="lg"
                align="right"
              >
                {_value(key, value || 0)}
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}

function _value(key: string, value: number) {
  switch (key) {
    case "pnlRatio":
      return `${(100 * value).toLocaleString()}%`;
    case "winRate":
      return `${(100 * value).toLocaleString()}%`;
    case "recoverDays":
      return value ? `${value.toLocaleString()} days` : "-";
    case "dailyMaxDrawdownRatio":
      return `${(100 * value).toLocaleString()}%`;
    case "maxDDRatio":
      return `${(100 * value).toLocaleString()}%`;
    case "annualizedSharpRatio":
      return value ? `${value.toLocaleString()}` : "-";
    case "maxLeverage":
      return value ? `${value.toLocaleString()}x` : "-";
    default:
      return "-";
  }
}
