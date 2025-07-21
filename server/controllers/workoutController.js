const Workout = require('../models/Workout');
const { extractStructuredData } = require('../utils/patternAnalysis');

// Save workout from user message
const saveWorkoutFromMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Extract structured data from message
    const extractedData = extractStructuredData(message);
    
    if (!extractedData.hasStructuredFormat) {
      return res.status(400).json({ 
        error: 'Message does not contain structured workout data',
        message: 'Please use the format: "[Exercise] were [difficulty], [body part] sore. Mood: [mood]. Journal: Workouts, [type], [details]."'
      });
    }

    // Parse journal details to extract exercise information
    const journalDetails = extractedData.journalDetails;
    const exercises = [];
    
    if (journalDetails) {
      // Parse exercise details from journal string
      const details = journalDetails.details;
      
      // Extract exercise name and details
      const exerciseMatch = details.match(/^([^0-9]+?)\s*(\d+x\d+)?\s*(?:at\s*(\d+\s*lbs?))?/i);
      if (exerciseMatch) {
        const exerciseName = exerciseMatch[1].trim();
        const setsReps = exerciseMatch[2];
        const weight = exerciseMatch[3];
        
        exercises.push({
          name: exerciseName,
          sets: setsReps ? parseInt(setsReps.split('x')[0]) : null,
          reps: setsReps ? parseInt(setsReps.split('x')[1]) : null,
          weight: weight || null,
          notes: details
        });
      } else {
        // Fallback: use the full details as exercise name
        exercises.push({
          name: details,
          notes: details
        });
      }
    }

    // Create workout record
    const workout = new Workout({
      userId,
      type: journalDetails?.type || 'CrossFit',
      exercises,
      difficulty: extractedData.difficulty || 'okay',
      mood: extractedData.mood || 'Neutral',
      soreness: extractedData.soreness ? [{
        area: extractedData.soreness,
        intensity: 'moderate'
      }] : [],
      notes: message
    });

    await workout.save();

    res.status(201).json({
      message: 'Workout saved successfully',
      workout: {
        id: workout._id,
        type: workout.type,
        exercises: workout.exercises,
        difficulty: workout.difficulty,
        mood: workout.mood,
        soreness: workout.soreness,
        date: workout.date
      }
    });
  } catch (error) {
    console.error('Save workout error:', error);
    res.status(500).json({
      error: 'Failed to save workout',
      message: 'Internal server error'
    });
  }
};

// Get user's workout history
const getWorkoutHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, type, exercise } = req.query;

    const query = { userId };
    
    if (type) {
      query.type = type;
    }
    
    if (exercise) {
      query['exercises.name'] = { $regex: exercise, $options: 'i' };
    }

    const workouts = await Workout.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Workout.countDocuments(query);

    res.json({
      workouts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get workout history error:', error);
    res.status(500).json({
      error: 'Failed to get workout history',
      message: 'Internal server error'
    });
  }
};

// Get workout statistics
const getWorkoutStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get workout frequency
    const workoutCount = await Workout.countDocuments({
      userId,
      date: { $gte: startDate }
    });

    // Get most common exercises
    const exerciseStats = await Workout.aggregate([
      { $match: { userId, date: { $gte: startDate } } },
      { $unwind: '$exercises' },
      { $group: { _id: '$exercises.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get mood trends
    const moodStats = await Workout.aggregate([
      { $match: { userId, date: { $gte: startDate } } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get soreness patterns
    const sorenessStats = await Workout.aggregate([
      { $match: { userId, date: { $gte: startDate } } },
      { $unwind: '$soreness' },
      { $group: { _id: '$soreness.area', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      workoutCount,
      exerciseStats,
      moodStats,
      sorenessStats,
      period: `${days} days`
    });
  } catch (error) {
    console.error('Get workout stats error:', error);
    res.status(500).json({
      error: 'Failed to get workout statistics',
      message: 'Internal server error'
    });
  }
};

// Delete workout
const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const workout = await Workout.findOneAndDelete({ _id: id, userId });
    
    if (!workout) {
      return res.status(404).json({
        error: 'Workout not found',
        message: 'Workout does not exist or you do not have permission to delete it'
      });
    }

    res.json({
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({
      error: 'Failed to delete workout',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  saveWorkoutFromMessage,
  getWorkoutHistory,
  getWorkoutStats,
  deleteWorkout
}; 