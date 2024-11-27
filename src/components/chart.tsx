import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";

const Chart = ({ data }: { data: number[][] }) => {
  const chartConfig = useMemo(() => {
    let initValue = 1;
    return {
      series: [
        {
          name: "Equity Ratio",
          data: data.map(([ts, equity], idx) => {
            if (idx === 0) {
              initValue = equity;
            }
            // eslint-disable-next-line no-console
            return {
              x: ts,
              y: (equity / initValue) * 100,
            };
          }),
        },
      ],
      options: {
        stroke: {
          curve: "smooth" as const,
          width: 1.5,
        },
        chart: {
          type: "area" as const,
          stacked: false,
          toolbar: { show: false },
        },
        dataLabels: {
          enabled: false,
        },
        markers: {
          size: 0,
        },
        title: {
          text: "Equity Ratio",
        },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            inverseColors: false,
            opacityFrom: 0.5,
            opacityTo: 0,
            stops: [0, 90, 100],
          },
        },
        yaxis: {
          labels: {
            formatter: (val: number) =>
              `${Math.round(val).toLocaleString()}%`,
          },
        },
        xaxis: {
          type: "datetime" as const,
        },
        colors: ["orange"],
        tooltip: {
          // enabled: false, // TODO: enable
          shared: false,
          y: {
            formatter: (val: number) =>
              `${Math.round(val).toLocaleString()}%`,
          },
        },
        annotations: {
          yaxis: [
            {
              y: 0,
              borderColor: "orange",
              strokeDashArray: 0,
              borderWidth: 1.5,
            },
          ],
        },
      },
    };
  }, [data]);

  return (
    <div>
      <ReactApexChart
        options={chartConfig.options}
        series={chartConfig.series}
        type="area"
      />
    </div>
  );
};

export default Chart;
