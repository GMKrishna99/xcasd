import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { MdPendingActions } from "react-icons/md";
import { LuFileX } from "react-icons/lu";
import {
  BsFileEarmarkCheck,
  BsArrowUpRight,
  BsArrowDownRight,
} from "react-icons/bs";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Dashboard_API } from "../../Constants/apiRoutes";

import axios from "axios";
import "chart.js/auto";
import LoadingAnimation from "../../Components/Loading/LoadingAnimation";

Chart.register(...registerables);

const Dashboard = () => {
  const lineChartRef = useRef(null);
  const doughnutChartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalDocuments: 0,
    pendingApprovals: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0,
    userRoles: [],
  });
  const [selectedStatus, setSelectedStatus] = useState("all");

  const statusOptions = [
    { id: "all", name: "Select Status" },
    { id: "approved", name: "Approved" },
    { id: "pending", name: "Pending" },
    { id: "rejected", name: "Rejected" },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("UserID");
    const tenantId = localStorage.getItem("TenantID");

    try {
      const response = await axios.post(
        Dashboard_API,
        {
          UserId: userId,
          TenantId: tenantId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentages for the stats
  const calculatePercentage = (value) => {
    return dashboardData.totalDocuments > 0
      ? Math.round((value / dashboardData.totalDocuments) * 100)
      : 0;
  };

  const approvedPercentage = calculatePercentage(
    dashboardData.approvedDocuments
  );
  const pendingPercentage = calculatePercentage(dashboardData.pendingApprovals);
  const rejectedPercentage = calculatePercentage(
    dashboardData.rejectedDocuments
  );

  // Update doughnut chart data
  const doughnutData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      {
        data: [
          dashboardData.approvedDocuments,
          dashboardData.pendingApprovals,
          dashboardData.rejectedDocuments,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.2)",
          "rgba(234, 179, 8, 0.2)",
          "rgba(239, 68, 68, 0.2)",
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(234, 179, 8, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Update line chart data (using dummy data since we don't have timeline data)
  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Approved Documents",
        data: [
          dashboardData.approvedDocuments,
          dashboardData.approvedDocuments,
          dashboardData.approvedDocuments,
        ],
        fill: true,
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderColor: "#10B981",
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#10B981",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
        borderWidth: 2,
        cubicInterpolationMode: "monotone",
      },
      {
        label: "Pending Documents",
        data: [
          dashboardData.pendingApprovals,
          dashboardData.pendingApprovals,
          dashboardData.pendingApprovals,
        ],
        fill: true,
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderColor: "#F59E0B",
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#F59E0B",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
        borderWidth: 2,
        cubicInterpolationMode: "monotone",
      },
      {
        label: "Rejected Documents",
        data: [
          dashboardData.rejectedDocuments,
          dashboardData.rejectedDocuments,
          dashboardData.rejectedDocuments,
        ],
        fill: true,
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderColor: "#EF4444",
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#EF4444",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
        borderWidth: 2,
        cubicInterpolationMode: "monotone",
      },
    ],
  };

  // Cleanup chart instances on component unmount
  useEffect(() => {
    const lineChartInstance = lineChartRef.current;
    const doughnutChartInstance = doughnutChartRef.current;
    return () => {
      if (lineChartInstance) {
        lineChartInstance.destroy();
      }

      if (doughnutChartInstance) {
        doughnutChartInstance.destroy();
      }
    };
  }, []);

  return (
    <div className="main-container">
      {loading && <LoadingAnimation />}

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="heading">Dasboard</h1>
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-64">
            <Combobox value={selectedStatus} onChange={setSelectedStatus}>
              <div className="relative">
                <Combobox.Input
                  className="w-full h-10 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  displayValue={(status) => {
                    const option = statusOptions.find(
                      (opt) => opt.id === status
                    );
                    return option ? option.name : "Select Status";
                  }}
                  placeholder="Select Status"
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                </Combobox.Button>
                <Combobox.Options className="absolute z-30 w-full mt-1 bg-white rounded-md shadow-lg">
                  {statusOptions.map((status) => (
                    <Combobox.Option
                      key={status.id}
                      value={status.id}
                      className={({ active }) =>
                        `p-2 cursor-pointer ${
                          active ? "bg-blue-500 text-white" : "text-gray-900"
                        }`
                      }
                    >
                      {status.name}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </div>
            </Combobox>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Approved Documents */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <BsFileEarmarkCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Approved Documents
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.approvedDocuments}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <span className="text-sm text-green-600">
                {approvedPercentage}% of total documents
              </span>
            </div>
          </div>
        </div>

        {/* Pending Documents */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <MdPendingActions className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Pending Documents
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.pendingApprovals}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <span className="text-sm text-yellow-600">
                {pendingPercentage}% of total documents
              </span>
            </div>
          </div>
        </div>

        {/* Rejected Documents */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <LuFileX className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Rejected Documents
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.rejectedDocuments}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <span className="text-sm text-red-600">
                {rejectedPercentage}% of total documents
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Timeline Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex flex-col space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Document Analytics
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Document flow analysis
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-4 bg-gray-50/80 px-4 py-2 rounded-xl">
                  <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                    1D
                  </button>
                  <button className="px-3 py-1 text-sm font-medium bg-white text-gray-900 shadow-sm rounded-lg">
                    1W
                  </button>
                  <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                    1M
                  </button>
                  <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                    1Y
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-900">
                    Approved
                  </span>
                  <span className="flex items-center text-xs font-medium text-emerald-600">
                    <BsArrowUpRight className="w-3 h-3 mr-1" />
                    {approvedPercentage}%
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-emerald-900">
                    {dashboardData.approvedDocuments}
                  </span>
                  <span className="ml-2 text-sm text-emerald-700">
                    documents
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-900">
                    Pending
                  </span>
                  <span className="flex items-center text-xs font-medium text-amber-600">
                    <BsArrowDownRight className="w-3 h-3 mr-1" />
                    {pendingPercentage}%
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-amber-900">
                    {dashboardData.pendingApprovals}
                  </span>
                  <span className="ml-2 text-sm text-amber-700">documents</span>
                </div>
              </div>

              <div className="bg-red-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-900">
                    Rejected
                  </span>
                  <span className="flex items-center text-xs font-medium text-red-600">
                    <BsArrowDownRight className="w-3 h-3 mr-1" />
                    {rejectedPercentage}%
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-red-900">
                    {dashboardData.rejectedDocuments}
                  </span>
                  <span className="ml-2 text-sm text-red-700">documents</span>
                </div>
              </div>
            </div>

            <div className="relative h-[320px] mt-2">
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: "index",
                    intersect: false,
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: "white",
                      titleColor: "#111827",
                      bodyColor: "#4B5563",
                      borderColor: "#E5E7EB",
                      borderWidth: 1,
                      padding: 12,
                      boxPadding: 6,
                      usePointStyle: true,
                      callbacks: {
                        label: function (context) {
                          let label = context.dataset.label || "";
                          if (label) {
                            label += ": ";
                          }
                          if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat("en-US", {
                              notation: "compact",
                              compactDisplay: "short",
                            }).format(context.parsed.y);
                          }
                          return label;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                        drawBorder: false,
                      },
                      ticks: {
                        font: {
                          size: 12,
                          family: "Inter",
                        },
                        color: "#9CA3AF",
                        maxRotation: 0,
                      },
                    },
                    y: {
                      position: "right",
                      grid: {
                        color: "#F3F4F6",
                        drawBorder: false,
                        lineWidth: 1,
                      },
                      ticks: {
                        font: {
                          size: 12,
                          family: "Inter",
                        },
                        color: "#9CA3AF",
                        padding: 12,
                        callback: function (value) {
                          return new Intl.NumberFormat("en-US", {
                            notation: "compact",
                            compactDisplay: "short",
                          }).format(value);
                        },
                      },
                      border: {
                        display: false,
                      },
                    },
                  },
                  elements: {
                    line: {
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Document Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Document Status Distribution
          </h2>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                  title: {
                    display: true,
                    text: "Current Document Status",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
