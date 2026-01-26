// src/pages/dashboard/MySplitz.jsx
import { useState } from "react";
import { ChevronDown, ListFilter, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMySplits, useDeleteSplit } from "../../../services/queries/split";
import screen from "../../../assets/screen.svg";

function MySplitz() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: mySplits = [], isLoading, isFetching } = useMySplits();
  const deleteSplit = useDeleteSplit();

  const allFilter = ["All", "Active", "Success", "Failed"];

  const filterCounts = {
    All: mySplits.length,
    Active: mySplits.filter(item => 
      (item.status || "active").toLowerCase() === "active"
    ).length,
    Success: mySplits.filter(item => 
      (item.status || "").toLowerCase() === "success"
    ).length,
    Failed: mySplits.filter(item => 
      (item.status || "").toLowerCase() === "failed"
    ).length
  };

  const filteredData = mySplits.filter(item => {
    const itemStatus = (item.status || "active").toLowerCase();
    const filterLower = filter.toLowerCase();
    
    const statusMatch = filter === "All" || itemStatus === filterLower;
    
    const searchMatch = searchQuery === "" || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return statusMatch && searchMatch;
  });

  const goCreateSplitz = () => {
    navigate("/dashboard/create-splitz");
  };

  const handleViewDetails = (id) => {
    navigate(`/dashboard/splitz-details/${id}`);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this split?')) return;
    
    try {
      await deleteSplit.mutateAsync(id);
    } catch (error) {
      alert(error.message || 'Failed to delete split');
    }
  };

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(numAmount);
  };

  const calculateProgress = (split) => {
    const participants = split.participants?.length || 0;
    const maxParticipants = split.max_participants || 1;
    return Math.min((participants / maxParticipants) * 100, 100);
  };

  // Determine role based on backend response
  const getUserRole = (split) => {
    if (split.role) return split.role === 'creator' ? 'Creator' : 'Participant';
    const currentUserId = localStorage.getItem('userId');
    return split.user === parseInt(currentUserId) ? 'Creator' : 'Participant';
  };

  const canDelete = (split) => {
    return getUserRole(split) === 'Creator';
  };

  return (
    <div className="w-full flex flex-col h-fit bg-gray-50">
      {/* Page Title */}
      <div className="flex items-center justify-between px-3 md:px-6 py-1.5 md:py-2">
        <div>
          <h2 className="text-sm md:text-lg font-bold text-gray-800">
            My Splitz
          </h2>
          <p className="text-[10px] md:text-sm text-gray-500">
            Check your splitz history
          </p>
        </div>

        <button className="flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 text-xs md:text-sm rounded-md hover:bg-gray-50 transition">
          This month
          <ChevronDown size={14} className="md:w-4 md:h-4" />
        </button>
      </div>

      {/* Search Section */}
      <div className="flex items-center justify-end gap-1.5 md:gap-2 px-3 md:px-6 py-1">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for your splitz..."
            className="w-full pl-8 md:pl-9 pr-3 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
        </div>

        <button className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center border border-gray-300 rounded-lg text-[#67707E] hover:bg-green-600 hover:text-white hover:border-green-600 transition" aria-label="Filter">
          <ListFilter size={16} className="md:w-[18px] md:h-[18px]" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-4 md:space-x-8 px-3 md:px-6 overflow-x-auto">
          {allFilter.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`flex-shrink-0 pb-2 md:pb-3 relative ${
                filter === item
                  ? 'text-green-700 border-b-2 border-green-700 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-xs md:text-base">
                {item} ({filterCounts[item]})
                {isFetching && item === filter && (
                  <span className="ml-1 inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="px-0 md:px-6 mt-2 md:mt-4 flex-1">
        {isLoading ? (
          <div className="space-y-2 md:space-y-3 px-3 md:px-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white p-3 md:p-4 rounded-lg animate-pulse">
                <div className="h-3 md:h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-2.5 md:h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#67707E]">
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs md:text-base font-semibold text-white whitespace-nowrap">Splitz name</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs md:text-base font-semibold text-white whitespace-nowrap">Role</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs md:text-base font-semibold text-white whitespace-nowrap">Status</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs md:text-base font-semibold text-white whitespace-nowrap">Progress</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs md:text-base font-semibold text-white whitespace-nowrap">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((split) => {
                      const progress = calculateProgress(split);
                      const role = getUserRole(split);

                      return (
                        <tr key={split.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-2 md:py-3 px-2 md:px-4">
                            <div>
                              <div className="font-medium text-gray-900 text-xs md:text-sm">{split.title}</div>
                              <div className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                                {formatCurrency(split.amount)} • {split.max_participants || 1} participants
                              </div>
                            </div>
                          </td>

                          <td className="py-2 md:py-3 px-2 md:px-4">
                            <span
                              className={`inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                                role === 'Creator'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {role}
                            </span>
                          </td>

                          <td className="py-2 md:py-3 px-2 md:px-4">
                            <span
                              className={`inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                                (split.status || 'active').toLowerCase() === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : (split.status || '').toLowerCase() === 'success'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {split.status || 'Active'}
                            </span>
                          </td>

                          <td className="py-2 md:py-3 px-2 md:px-4">
                            <div className="w-20 md:w-32">
                              <div className="flex items-center justify-between mb-0.5 md:mb-1">
                                <span className="text-xs font-medium text-gray-700">
                                  {Math.round(progress)}%
                                </span>
                                <span className="text-[10px] md:text-xs text-gray-500">
                                  {split.participants?.length || 0}/{split.max_participants || 1}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                                <div
                                  className={`h-1.5 md:h-2 rounded-full ${
                                    progress === 100
                                      ? 'bg-green-600'
                                      : progress > 70
                                      ? 'bg-blue-600'
                                      : progress > 40
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-2 md:py-3 px-2 md:px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewDetails(split.id)}
                                className="px-2.5 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium text-green-700 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors whitespace-nowrap"
                              >
                                View Details
                              </button>
                              {canDelete(split) && (
                                <button
                                  onClick={(e) => handleDelete(split.id, e)}
                                  disabled={deleteSplit.isPending}
                                  className="p-1.5 md:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                  title="Delete Split"
                                >
                                  <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5}>
                        <div className="flex items-center justify-center px-4 py-8 md:py-12">
                          <div className="max-w-md w-full text-center">
                            <img
                              src={screen}
                              alt="analytics"
                              className="mx-auto max-h-32 md:max-h-48 object-contain"
                            />

                            <h1 className="mt-3 md:mt-4 font-bold text-base md:text-lg text-[#67707E]/40">
                              {searchQuery
                                ? 'No splitz found'
                                : "You haven't created or joined any splitz yet"}
                            </h1>

                            <p className="mt-1.5 md:mt-2 text-xs md:text-sm text-[#67707E]/60">
                              {searchQuery
                                ? "Try adjusting your search or filter to find what you're looking for."
                                : 'Splitz you create or join will appear here for easy tracking and updates.'}
                            </p>

                            <div className="mt-3 md:mt-4 flex flex-col gap-2 md:gap-3 px-4 md:px-0">
                              <button
                                onClick={goCreateSplitz}
                                className="flex-1 bg-[#1F8225] text-white py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium hover:bg-green-700 transition active:scale-95"
                              >
                                Create a splitz
                              </button>

                              <button
                                className="flex-1 border border-green-600 text-green-700 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium hover:bg-green-50 transition active:scale-95"
                                onClick={() => navigate('/dashboard/allsplits')}
                              >
                                Join Splitz
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MySplitz;