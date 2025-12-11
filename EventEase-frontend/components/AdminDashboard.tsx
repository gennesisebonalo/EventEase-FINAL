import React, { useState, useEffect, useCallback } from 'react';
import { dashboardApi, DashboardOverview, Event, EventsResponse, EventAttendeesResponse, Attendee } from '../services/dashboardApi';
import StatCard from './StatCard';
import EventsTable from './EventsTable';
import AddEventModal from './AddEventModal';
import AttendeesModal from './AttendeesModal';
import LoadingSpinner from './LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [eventsData, setEventsData] = useState<EventsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  // Fetch dashboard overview data
  const fetchDashboardData = useCallback(async () => {
    try {
      const data = await dashboardApi.getDashboardOverview();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    }
  }, []);

  // Fetch events data
  const fetchEventsData = useCallback(async () => {
    setEventsLoading(true);
    try {
      const data = await dashboardApi.getEventsList({
        search: searchTerm,
        status: statusFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
        page: currentPage,
        per_page: 10,
      });
      setEventsData(data);
    } catch (error) {
      console.error('Error fetching events data:', error);
      toast.error('Failed to fetch events data');
    } finally {
      setEventsLoading(false);
    }
  }, [searchTerm, statusFilter, sortBy, sortOrder, currentPage]);

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardData(), fetchEventsData()]);
      setLoading(false);
    };
    loadInitialData();
  }, [fetchDashboardData, fetchEventsData]);

  // Handle view attendees
  const handleViewAttendees = async (eventId: number) => {
    try {
      setAttendeesLoading(true);
      setAttendeesModalOpen(true);
      setSelectedEventTitle('');
      const data: EventAttendeesResponse = await dashboardApi.getEventAttendees(eventId);
      setSelectedEventTitle(data.event.title);
      setAttendees(data.attendees);
    } catch (error) {
      console.error('Error fetching attendees:', error);
      toast.error('Failed to fetch attendees');
      setAttendees([]);
    } finally {
      setAttendeesLoading(false);
    }
  };

  // Real-time updates - poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchEventsData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardData, fetchEventsData]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle add event
  const handleAddEvent = async (eventData: any) => {
    try {
      await dashboardApi.createEvent(eventData);
      toast.success('Event created successfully!');
      setIsAddEventModalOpen(false);
      fetchEventsData(); // Refresh events list
      fetchDashboardData(); // Refresh dashboard data
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  // Handle mark as completed
  const handleMarkCompleted = async (eventId: number) => {
    try {
      await dashboardApi.markEventCompleted(eventId);
      toast.success('Event marked as completed!');
      fetchEventsData(); // Refresh events list
      fetchDashboardData(); // Refresh dashboard data
    } catch (error) {
      console.error('Error marking event as completed:', error);
      toast.error('Failed to mark event as completed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">EventEase Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your events and track real-time analytics
              </p>
            </div>
            <button
              onClick={() => setIsAddEventModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Event
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Ongoing Events"
              value={dashboardData.ongoing_events}
              icon="🟢"
              color="green"
              trend=""
            />
            <StatCard
              title="Upcoming Events"
              value={dashboardData.upcoming_events}
              icon="📅"
              color="blue"
              trend=""
            />
            <StatCard
              title="Completed Events"
              value={dashboardData.completed_events}
              icon="✅"
              color="gray"
              trend=""
            />
            <StatCard
              title="Registrations"
              value={dashboardData.total_registrations}
              icon="📝"
              color="purple"
              trend=""
            />
          </div>
        )}

        {/* Events Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Events Management</h2>
          </div>
          
          <EventsTable
            events={eventsData?.events || []}
            pagination={eventsData?.pagination}
            loading={eventsLoading}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSearch={handleSearch}
            onStatusFilter={handleStatusFilter}
            onSort={handleSort}
            onPageChange={handlePageChange}
            onMarkCompleted={handleMarkCompleted}
            onViewAttendees={handleViewAttendees}
          />
        </div>
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        onSubmit={handleAddEvent}
      />

      <AttendeesModal
        isOpen={attendeesModalOpen}
        onClose={() => setAttendeesModalOpen(false)}
        eventTitle={selectedEventTitle}
        attendees={attendees}
        loading={attendeesLoading}
      />
    </div>
  );
};

export default AdminDashboard;
