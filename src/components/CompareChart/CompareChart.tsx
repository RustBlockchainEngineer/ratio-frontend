import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: '26/09',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: '27/09',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: '28/09',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: '29/09',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: '30/09',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: '01/10',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: '02/10',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

type compareChartProps = {
  type: string;
  height: number;
  containerHeight: string;
};

const CompareChart = ({ type, height, containerHeight }: compareChartProps) => {
  return (
    <div className="compareChart" style={{ height: height }}>
      <div className="compareChart__header">
        <h4>{type} over time</h4>
        <div className="compareChart__header__buttons">
          <button>1W</button>
          <button className="ml-2">1M</button>
          <button className="ml-2">1Y</button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={containerHeight}>
        <LineChart
          width={400}
          height={300}
          data={data}
          margin={{
            top: 25,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis padding={{ left: 30, right: 30 }} dataKey="name" />
          <YAxis />
          {/* <Tooltip /> */}
          <Line type="linear" dataKey="pv" stroke="#FF3131" dot activeDot={{ r: 5 }} />
          <Line type="linear" dataKey="uv" stroke="#5FB5FF" dot />
        </LineChart>
      </ResponsiveContainer>
      <div className="compareChart__legendContainer">
        <div className="compareChart__legend">
          <div className="compareChart__legendLine" style={{ backgroundColor: '#FF3131' }}></div>
          <div className="compareChart__legendText">
            <h4>STEP-USDC</h4>
            <h5>RAYDIUM</h5>
          </div>
        </div>
        <div className="compareChart__legend ml-2">
          <div className="compareChart__legendLine" style={{ backgroundColor: '#FF69CE' }}></div>
          <div className="compareChart__legendText">
            <h4>STEP-USDC</h4>
            <h5>RAYDIUM</h5>
          </div>
        </div>
        <div className="compareChart__legend ml-2">
          <div className="compareChart__legendLine" style={{ backgroundColor: '#5FB5FF' }}></div>
          <div className="compareChart__legendText">
            <h4>STEP-USDC</h4>
            <h5>RAYDIUM</h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareChart;
