import Task from '../models/Task.js';

/**
 * taskController.js
 * Handles all the CRUD logic for tasks.
 * 
 * I've added some basic filtering and search support 
 * as requested in the requirements.
 */

// Get all tasks for the logged in user
export const getTasks = async (req, res, next) => {
  try {
    // Grab query params for filtering/sorting
    const { search, status, sort, page = 1, limit = 10 } = req.query;
    
    // Start with the basic user filter
    let query = { user: req.user.id };

    // Add search if provided (checks title and description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status (Pending, In Progress, Completed)
    if (status && status !== 'All') {
      query.status = status;
    }

    // Default sorting is newest first
    let sortOrder = { createdAt: -1 };
    if (sort === 'oldest') sortOrder = { createdAt: 1 };
    if (sort === 'title') sortOrder = { title: 1 };

    // Calculate pagination skip
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skipCount = (pageNum - 1) * limitNum;
    
    const tasks = await Task.find(query)
      .sort(sortOrder)
      .skip(skipCount)
      .limit(limitNum);

    const totalTasks = await Task.countDocuments(query);

    // Return the data along with some pagination info
    res.status(200).json({
      success: true,
      count: tasks.length,
      total: totalTasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalTasks / limitNum)
      },
      data: tasks
    });
  } catch (err) {
    console.error('Error in getTasks:', err.message);
    next(err);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      user: req.user.id
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    console.error('Error in createTask:', err.message);
    next(err);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user.id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    console.error('Error in updateTask:', err.message);
    next(err);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error('Error in deleteTask:', err.message);
    next(err);
  }
};
