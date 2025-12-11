import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../services/dashboardApi';

interface Category {
  id: number;
  name: string;
}

interface Venue {
  id: number;
  name: string;
  capacity?: number;
  location?: string;
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    venue_id: '',
    start_time: '',
    end_time: '',
    status: 'upcoming'
  });

  // Load categories and venues when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategoriesAndVenues();
    }
  }, [isOpen]);

  const loadCategoriesAndVenues = async () => {
    setLoading(true);
    try {
      const [categoriesData, venuesData] = await Promise.all([
        dashboardApi.getCategories(),
        dashboardApi.getVenues()
      ]);
      setCategories(categoriesData);
      setVenues(venuesData);
    } catch (error) {
      console.error('Error loading categories and venues:', error);
      // Set fallback data if API fails
      setCategories([
        { id: 1, name: 'Academic' },
        { id: 2, name: 'Sports' },
        { id: 3, name: 'Cultural' },
        { id: 4, name: 'Social' }
      ]);
      setVenues([
        { id: 1, name: 'Main Auditorium', capacity: 500 },
        { id: 2, name: 'Conference Room A', capacity: 50 },
        { id: 3, name: 'Gymnasium', capacity: 200 },
        { id: 4, name: 'Library Hall', capacity: 100 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category_id || !formData.venue_id || !formData.start_time || !formData.end_time) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        title: '',
        description: '',
        category_id: '',
        venue_id: '',
        start_time: '',
        end_time: '',
        status: 'upcoming'
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Create New Event</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter event description"
              rows={3}
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => handleInputChange('category_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              {loading ? (
                <option disabled>Loading categories...</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
            {categories.length === 0 && !loading && (
              <p className="text-sm text-gray-500 mt-1">No categories found</p>
            )}
          </div>

          {/* Venue Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue *
            </label>
            <select
              value={formData.venue_id}
              onChange={(e) => handleInputChange('venue_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Venue</option>
              {loading ? (
                <option disabled>Loading venues...</option>
              ) : (
                venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} {venue.capacity && `(${venue.capacity} capacity)`}
                  </option>
                ))
              )}
            </select>
            {venues.length === 0 && !loading && (
              <p className="text-sm text-gray-500 mt-1">No venues found</p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => handleInputChange('start_time', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time *
            </label>
            <input
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => handleInputChange('end_time', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
