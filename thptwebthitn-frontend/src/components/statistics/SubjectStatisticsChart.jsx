import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SubjectStatisticsChart = ({ statistics }) => {
  // Sort statistics by attempt count for better visualization
  const sortedStats = [...statistics].sort((a, b) => b.attemptCount - a.attemptCount);
  
  const data = {
    labels: sortedStats.map(stat => stat.subject.name),
    datasets: [
      {
        label: 'Số đề thi',
        data: sortedStats.map(stat => stat.examCount),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Lượt thi',
        data: sortedStats.map(stat => stat.attemptCount),
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1
      },
      {
        label: 'Điểm trung bình',
        data: sortedStats.map(stat => stat.averageScore),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Số lượng'
        }
      },
      y1: {
        position: 'right',
        beginAtZero: true,
        max: 10,
        title: {
          display: true,
          text: 'Điểm'
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Thống kê theo môn học'
      }
    }
  };
  
  return (
    <div style={{ height: '400px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default SubjectStatisticsChart;