import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, ChevronDown } from "lucide-react";

const serviceStatuses = ["pending", "completed", "in-progress", "cancelled"];
 
const statusColorMap = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300 focus:ring-yellow-500",
  completed: "bg-green-100 text-green-800 border-green-300 focus:ring-green-500",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-300 focus:ring-blue-500",
  cancelled: "bg-red-100 text-red-800 border-red-300 focus:ring-red-500",
};

const orderProgressStatuses = [
  "Progress",
  "Form Filled",
  "Draft Created by AI",
  "Payment Pending",
  "Draft going to lawyer",
  "Lawyer Updated the draft",
  "Lawyer approved and signed",
  "Delivered to your Dashboard",
];

function QnaTable({ qna }) {
  if (!qna || qna.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 w-full overflow-hidden border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 text-xs">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-2 text-left font-semibold text-gray-600 tracking-wider">
              Question
            </th>
            <th scope="col" className="px-4 py-2 text-left font-semibold text-gray-600 tracking-wider">
              Answer
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {qna.map((item, index) => (
            <tr key={index}>
              <td className="px-4 py-2 text-gray-800 font-medium">{item.question}</td>
              <td className="px-4 py-2 text-gray-600">{item.answer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExpandedServiceCard({ order, onStatusChange, onProgressChange }) {
  const [expandedQnaIndex, setExpandedQnaIndex] = useState(null);

  const toggleQna = (index) => {
    setExpandedQnaIndex(expandedQnaIndex === index ? null : index);
  };

  return (
    <div className="p-4 bg-gray-50">
      <h4 className="text-md font-semibold mb-3 text-gray-800">Services</h4>
      <ul className="space-y-2">
        {order.services.map((service, index) => (
          <li
            key={index}
            className={`p-3 bg-white rounded-lg border border-gray-200 transition-all duration-200 ${service.qna ? 'cursor-pointer hover:bg-gray-50' : ''}`}
            onClick={() => service.qna && toggleQna(index)}
          >
            <div className="flex justify-between items-center gap-4">
              <div className="flex-grow flex items-center gap-2">
                <span className="font-medium text-gray-700">{service.name}</span>
                {service.qna && (
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedQnaIndex === index ? 'rotate-180' : ''}`} />
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={service.progress}
                  onChange={(e) => onProgressChange(order.orderNo, index, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {orderProgressStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <select
                  value={service.status}
                  onChange={(e) => onStatusChange(order.orderNo, index, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className={`text-xs border rounded-md px-2 py-1 focus:outline-none focus:ring-1 ${
                    statusColorMap[service.status] || "border-gray-300"
                  }`}
                >
                  {serviceStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {expandedQnaIndex === index && (
              <QnaTable qna={service.qna} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const DUMMY_ORDERS_DATA = [
  {
    orderNo: "ORD1001",
    customerName: "Aarav Sharma",
    totalAmount: "₹2500.00",
    dueAmount: "₹500.00",
    services: [
      { 
        name: "Trademark Application", 
        status: "completed", 
        progress: "Delivered to your Dashboard",
        qna: [
          { question: "What is the proposed trademark?", answer: "Abyd" },
          { question: "What is the class of goods/services?", answer: "Class 42 - Software as a service (SaaS)" },
          { question: "Who is the applicant?", answer: "Aarav Sharma" },
          { question: "What is the applicant's address?", answer: "123 Tech Park, Bangalore" },
          { question: "Is the trademark a word, logo, or both?", answer: "Logo" },
          { question: "Date of first use?", answer: "Not yet used" },
        ]
      },
      { name: "Logo Design", status: "completed", progress: "Delivered to your Dashboard" },
      { name: "Business Registration", status: "pending", progress: "Form Filled" },
      { name: "GST Registration", status: "completed", progress: "Delivered to your Dashboard" },
      { name: "Website Development", status: "in-progress", progress: "Draft going to lawyer" },
    ],
  },
  {
    orderNo: "ORD1002",
    customerName: "Saanvi Gupta",
    totalAmount: "₹1200.50",
    dueAmount: "₹0.00",
    services: [
      { 
        name: "Company Incorporation", 
        status: "completed", 
        progress: "Delivered to your Dashboard",
        qna: [
          { question: "Company Name options?", answer: "1. Saanvi Tech, 2. Gupta Innovations" },
          { question: "Director Details?", answer: "Saanvi Gupta, DOB: 15-08-1990" },
        ]
      },
      { name: "Legal Consultation", status: "completed", progress: "Delivered to your Dashboard" },
    ],
  },
  {
    orderNo: "ORD1003",
    customerName: "Vivaan Singh",
    totalAmount: "₹3800.75",
    dueAmount: "₹1000.00",
    services: [
      { name: "Trademark Application", status: "completed", progress: "Lawyer approved and signed" },
      { name: "GST Registration", status: "completed", progress: "Delivered to your Dashboard" },
      { name: "Accounting Services", status: "pending", progress: "Payment Pending" },
      { name: "Contract Drafting", status: "completed", progress: "Delivered to your Dashboard" },
      { name: "Patent Filing", status: "pending", progress: "Draft Created by AI" },
      { name: "Legal Consultation", status: "completed", progress: "Delivered to your Dashboard" },
    ],
  },
  {
    orderNo: "ORD1004",
    customerName: "Myra Reddy",
    totalAmount: "₹850.00",
    dueAmount: "₹150.00",
    services: [
      { name: "Legal Consultation", status: "completed", progress: "Delivered to your Dashboard" },
      { name: "Logo Design", status: "pending", progress: "Progress" },
      { name: "Website Development", status: "pending", progress: "Progress" },
    ],
  },
  {
    orderNo: "ORD1005",
    customerName: "Advik Patel",
    totalAmount: "₹5200.00",
    dueAmount: "₹0.00",
    services: [
      { name: "Company Incorporation", status: "completed", progress: "Delivered to your Dashboard" },
      { name: "Trademark Application", status: "completed", progress: "Delivered to your Dashboard" },
      { name: "GST Registration", status: "completed", progress: "Delivered to your Dashboard" },
      { name: "Contract Drafting", status: "completed", progress: "Delivered to your Dashboard" },
      { name: "Accounting Services", status: "completed", progress: "Delivered to your Dashboard" },
    ],
  },
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [expandedOrderNo, setExpandedOrderNo] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const navigate = useNavigate();
  const location = useLocation();

  // If came via URL (e.g., /orders?type=DIY&uid=...), still works:
  const params = new URLSearchParams(location.search);
  const urlUid = params.get("uid") || "";
  const urlType = params.get("type") || params.get("category") || "";

  // Initialize orders state with dummy data
  useEffect(() => {
    // Use a deep copy to prevent modifying the original data
    setOrders(JSON.parse(JSON.stringify(DUMMY_ORDERS_DATA)));
  }, []);

  const handleServiceStatusChange = (orderNo, serviceIndex, newStatus) => {
    setOrders(currentOrders =>
      currentOrders.map(order => {
        if (order.orderNo === orderNo) {
          const newServices = [...order.services];
          newServices[serviceIndex].status = newStatus;
          return { ...order, services: newServices };
        }
        return order;
      })
    );
  };

  const handleServiceProgressChange = (orderNo, serviceIndex, newProgress) => {
    setOrders(currentOrders =>
      currentOrders.map(order => {
        if (order.orderNo === orderNo) {
          const newServices = [...order.services];
          newServices[serviceIndex].progress = newProgress;
          return { ...order, services: newServices };
        }
        return order;
      })
    );
  };

  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    return orders.filter(
      (o) =>
        o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase())
    );
  }, [orders, search]);

  useEffect(() => {
    setTotal(filteredOrders.length);
  }, [filteredOrders]);

  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredOrders, page, pageSize]);

  const maxPage = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-lg font-semibold text-[#2E2E2E]">
          Orders
        </div>
        <div className="relative max-w-md w-full">
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search by Order No or Customer"
            className="w-full bg-white border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 bg-gray-100 sticky top-0">
              <th className="px-6 py-4 font-semibold">Order No</th>
              <th className="px-6 py-4 font-semibold">Customer Name</th>
              <th className="px-6 py-4 font-semibold">Service Taken</th>
              <th className="px-6 py-4 font-semibold">Total Amount</th>
              <th className="px-6 py-4 font-semibold">Due Amount</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#6A6A6A]">
                  No matching orders found.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <React.Fragment key={order.orderNo}>
                  <tr 
                    className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => setExpandedOrderNo(expandedOrderNo === order.orderNo ? null : order.orderNo)}
                  >
                    <td className="px-6 py-4 font-medium text-blue-600 hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/order/${order.orderNo}`)}}>{order.orderNo}</td>
                    <td className="px-6 py-4 text-gray-800">{order.customerName}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {order.services.filter(s => s.status === 'completed').length}/{order.services.length} completed
                      </span>
                    </td>
                    <td className="px-4 py-3">{order.totalAmount}</td>
                    <td className="px-6 py-4 text-gray-800">{order.dueAmount}</td>
                  </tr>
                  {expandedOrderNo === order.orderNo && (
                    <tr className="bg-gray-50">
                      <td colSpan={5}>
                        <ExpandedServiceCard order={order} onStatusChange={handleServiceStatusChange} onProgressChange={handleServiceProgressChange} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / pagination */}
      <div className="flex items-center justify-between text-sm text-gray-700">
        <div>
          {paginatedOrders.length > 0
            ? `Showing ${(page - 1) * pageSize + 1} to ${Math.min(
                page * pageSize,
                total
              )} of ${total} orders.`
            : `No orders to display.`}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 border border-blue-500 bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 hover:bg-blue-600 transition-colors duration-200"
          >
            <span className="inline-flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Prev
            </span>
          </button>
          <div className="px-2 font-medium">{page} of {maxPage}</div>
          <button
            disabled={page >= maxPage}
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            className="px-4 py-2 border border-blue-500 bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 hover:bg-blue-600 transition-colors duration-200"
          >
            <span className="inline-flex items-center gap-1">
              Next
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
