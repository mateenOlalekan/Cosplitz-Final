import image1 from "../../assets/1.svg";
import image2 from "../../assets/2.svg";
import image3 from "../../assets/3.svg";
import image4 from "../../assets/4.svg";
import { MoreVertical, ChevronDown, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import AnalyticsCard from './AnalyticsCard';


// Mock data for the chart
const savingsData = [
  { date: 'Dec 10', savings: 3200 },
  { date: 'Dec 11', savings: 4100 },
  { date: 'Dec 12', savings: 3800 },
  { date: 'Dec 13', savings: 5200 },
  { date: 'Dec 14', savings: 6100 },
  { date: 'Dec 15', savings: 7200 },
];

const splitzData = [
  { name: 'Concert Ticket', role: 'Organiser', status: 'Active', progress: '3/5', action: '...' },
  { name: 'Ride splitz', role: 'Joiner', status: 'Completed', progress: '5/5', action: '...' },
  { name: 'Bulk Groceries', role: 'Buyer', status: 'Failed', progress: '2/5', action: '...' },
];

const AnalyticsDashboard = () => {
  const currentDate = format(new Date(), 'MMM d, yyyy');

  return (
    <div className="flex flex-col">

    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Analytics
            </h2>
            <p className="text-sm text-gray-500">
              Track your savings and activity
            </p>
          </div>

          <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-black text-sm font-medium rounded-md w-fit">
            This month <ChevronDown size={16} />
          </button>
        </div>

        {/* Stats Grid */}
<div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
  {/* Total Saved */}
  <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border-t-4 border-b-4 border-[#FFEFC2] hover:shadow-md transition-shadow duration-200">
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h3 className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2">Total Saved</h3>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">$12,000</p>
        <p className="text-gray-500 text-xs sm:text-sm">Compared to buying alone</p>
      </div>
      <div className="flex justify-between items-end mt-3 sm:mt-4">
        <div className="flex-1">
          <span className="inline-flex items-center text-xs sm:text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            +12.5%
          </span>
        </div>
        <img 
          src={image4} 
          alt="Total Saved" 
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex-shrink-0" 
        />
      </div>
    </div>
  </div>

  {/* Splitz joined */}
  <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border-t-4 border-b-4 border-[#81D975] hover:shadow-md transition-shadow duration-200">
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h3 className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2">Splitz joined</h3>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">10</p>
        <p className="text-gray-500 text-xs sm:text-sm">Last 30 days</p>
      </div>
      <div className="flex justify-between items-end mt-3 sm:mt-4">
        <div className="flex-1">
          <span className="inline-flex items-center text-xs sm:text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            +25%
          </span>
        </div>
        <img 
          src={image3} 
          alt="Splitz Joined" 
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex-shrink-0" 
        />
      </div>
    </div>
  </div>

  {/* Splitz created */}
  <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border-t-4 border-b-4 border-[#FFEFC2] hover:shadow-md transition-shadow duration-200">
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h3 className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2">Splitz created</h3>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">5</p>
        <p className="text-gray-500 text-xs sm:text-sm">Active</p>
      </div>
      <div className="flex justify-between items-end mt-3 sm:mt-4">
        <div className="flex-1">
          <span className="inline-flex items-center text-xs sm:text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            +15%
          </span>
        </div>
        <img 
          src={image2} 
          alt="Splitz Created" 
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex-shrink-0" 
        />
      </div>
    </div>
  </div>

  {/* People collaborated with */}
  <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border-t-4 border-b-4 border-[#81D975] hover:shadow-md transition-shadow duration-200">
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h3 className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2">People collaborated with</h3>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">21</p>
        <p className="text-gray-500 text-xs sm:text-sm">Nearby users</p>
      </div>
      <div className="flex justify-between items-end mt-3 sm:mt-4">
        <div className="flex-1">
          <span className="inline-flex items-center text-xs sm:text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            +40%
          </span>
        </div>
        <img 
          src={image1} 
          alt="People Collaborated With" 
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex-shrink-0" 
        />
      </div>
    </div>
  </div>
</div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
          {/* Savings Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your savings over time</h2>
                <p className="text-gray-500 text-sm mt-1">Daily savings accumulation</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={savingsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    ticks={[0, 2000, 4000, 6000, 8000]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="savings"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Comparison */}
          <AnalyticsCard />

        </div>

        {/* Splitz Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active and completed splitz</h2>
            <p className="text-gray-500 text-sm mt-1">Track your splitz activities and status</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Split name</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Progress</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {splitzData.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-t border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {item.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === 'Active' ? 'bg-green-100 text-green-800' :
                          item.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className={`h-full rounded-full ${
                              item.status === 'Active' ? 'bg-green-500' :
                                item.status === 'Completed' ? 'bg-gray-500' :
                                  'bg-red-500'
                            }`}
                            style={{
                              width: `${(parseInt(item.progress.split('/')[0]) / parseInt(item.progress.split('/')[1])) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-700">{item.progress}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}

      </div>
    </div>
    </div>

  );
};

export default AnalyticsDashboard;