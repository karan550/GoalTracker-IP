import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Target, CheckCircle } from 'lucide-react';
import { Card, Badge, LoadingSpinner } from '../components/ui';
import { formatDate } from '../utils/dateHelpers';
import goalService from '../services/goalService';
import milestoneService from '../services/milestoneService';
import toast from 'react-hot-toast';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [goals, setGoals] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [goalsRes, milestonesRes] = await Promise.all([
        goalService.getGoals({ includeArchived: false }),
        milestoneService.getUpcomingMilestones(365), // Get all milestones for the year
      ]);
      
      setGoals(goalsRes.data.data.goals || []);
      setMilestones(milestonesRes.data.data.milestones || []);
    } catch (error) {
      console.error('Calendar data error:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setIsLoading(false);
    }
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toDateString();
    
    const goalsForDate = goals.filter(
      goal => new Date(goal.targetDate).toDateString() === dateStr
    );
    
    const milestonesForDate = milestones.filter(
      milestone => new Date(milestone.dueDate).toDateString() === dateStr
    );
    
    return { goals: goalsForDate, milestones: milestonesForDate };
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const { goals: goalsForDate, milestones: milestonesForDate } = getEventsForDate(date);
    const totalEvents = goalsForDate.length + milestonesForDate.length;
    
    if (totalEvents === 0) return null;
    
    return (
      <div className="flex items-center justify-center mt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
      </div>
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const { goals: goalsForDate, milestones: milestonesForDate } = getEventsForDate(date);
    const hasEvents = goalsForDate.length > 0 || milestonesForDate.length > 0;
    
    return hasEvents ? 'has-events' : null;
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading calendar..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
        <p className="text-gray-400">View your goals and milestones timeline</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card variant="glass" className="calendar-container">
            <style>{`
              .calendar-container .react-calendar {
                width: 100%;
                background: transparent;
                border: none;
                font-family: inherit;
              }
              .calendar-container .react-calendar__tile {
                padding: 1rem 0.5rem;
                background: transparent;
                color: #9CA3AF;
                border-radius: 0.5rem;
              }
              .calendar-container .react-calendar__tile:enabled:hover {
                background: rgba(139, 92, 246, 0.1);
                color: #fff;
              }
              .calendar-container .react-calendar__tile--active {
                background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
                color: #fff;
              }
              .calendar-container .react-calendar__tile--now {
                background: rgba(139, 92, 246, 0.2);
                color: #fff;
              }
              .calendar-container .react-calendar__month-view__days__day--weekend {
                color: #F87171;
              }
              .calendar-container .react-calendar__navigation button {
                color: #fff;
                min-width: 44px;
                background: transparent;
                font-size: 1.125rem;
                padding: 0.5rem;
              }
              .calendar-container .react-calendar__navigation button:enabled:hover {
                background: rgba(139, 92, 246, 0.1);
                border-radius: 0.5rem;
              }
              .calendar-container .react-calendar__month-view__weekdays {
                color: #9CA3AF;
                font-weight: 600;
                font-size: 0.875rem;
              }
              .calendar-container .react-calendar__tile.has-events {
                font-weight: 600;
                color: #fff;
              }
            `}</style>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              tileClassName={tileClassName}
            />
          </Card>
        </motion.div>

        {/* Events for Selected Date */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Card variant="glass">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-primary-400" />
              <h2 className="text-lg font-bold text-white">
                {formatDate(selectedDate)}
              </h2>
            </div>

            {/* Goals */}
            {selectedDateEvents.goals.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Goals Due</h3>
                </div>
                <div className="space-y-2">
                  {selectedDateEvents.goals.map(goal => (
                    <div
                      key={goal._id}
                      className="p-3 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/goals/${goal._id}`}
                    >
                      <p className="text-sm font-medium text-white mb-1">{goal.title}</p>
                      <Badge variant="primary" size="sm">
                        {goal.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Milestones */}
            {selectedDateEvents.milestones.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Milestones Due</h3>
                </div>
                <div className="space-y-2">
                  {selectedDateEvents.milestones.map(milestone => (
                    <div
                      key={milestone._id}
                      className="p-3 rounded-lg bg-dark-800 border border-dark-700"
                    >
                      <p className="text-sm font-medium text-white">{milestone.title}</p>
                      {milestone.completed && (
                        <Badge variant="success" size="sm" className="mt-1">
                          Completed
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDateEvents.goals.length === 0 && selectedDateEvents.milestones.length === 0 && (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No events for this date</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CalendarPage;
