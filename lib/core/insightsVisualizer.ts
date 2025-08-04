// @ts-ignore
import Chart from "cli-chart";

interface RevenueByBuyer {
    totalRevenue: number,
    totalCost: number,
    buyerName: string,
    profit: number
}

interface RevenueByGood {
  totalRevenue: number,
  totalCost: number,
  profit: number,
  totalQuantitySold: number,
  goodName: string

}

interface RevenueByPeriod {
  totalRevenue: number,
  totalCost: number,
  totalQuantitySold: number,
  profit: number,
  period: number
}

interface buyerRevenueByPeriod {
  totalRevenue: number,
  totalCost: number,
  totalQuantitySold: number,
  profit: number,
  period: string,
  buyer: string
}
export function createRevenueByBuyerChart(data: RevenueByBuyer[]) {
  const chart = new Chart({
    xlabel: 'Buyer',
    ylabel: 'Revenue',
    direction: 'y',
    height: 20,
    width: 80,
    lmargin: 15,
    step: 4,
  });

  data.forEach((d: RevenueByBuyer) => {
    chart.addBar(d.totalRevenue);
    chart.draw();
    console.log(d.buyerName);
  });
}

export function createRevenueByGoodChart(data: RevenueByGood[]) {
  const chart = new Chart({
    xlabel: 'Good',
    ylabel: 'Revenue',
    direction: 'y',
    height: 20,
    width: 80,
    lmargin: 15,
    step: 4,
  });

  data.forEach((d: RevenueByGood) => {
    chart.addBar(d.totalRevenue);
  });
  chart.draw();
}

export function createRevenueByPeriodChart(data: RevenueByPeriod[]) {
  const chart = new Chart({
    xlabel: 'Period',
    ylabel: 'Revenue',
    direction: 'y',
    height: 20,
    width: 80,
    lmargin: 15,
    step: 4,
  });

  data.forEach((d: RevenueByPeriod) => {
    chart.addBar(d.totalRevenue);
  });
  chart.draw();
}

export function createBuyerRevenueByPeriodChart(data: buyerRevenueByPeriod[]) {
  const chart = new Chart({
    xlabel: 'Period',
    ylabel: 'Revenue',
    direction: 'y',
    height: 20,
    width: 80,
    lmargin: 15,
    step: 4,
  });

  data.forEach((d: buyerRevenueByPeriod) => {
    chart.addBar(d.totalRevenue);
  });
  chart.draw();
}
