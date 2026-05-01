const Groq = require('groq-sdk');
const Task = require('../models/Task');
const Project = require('../models/Project');

// Initialize Groq conditionally
let groq = null;
if (process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const generateDashboardSummary = async (req, res) => {
  if (!groq) return res.status(503).json({ message: 'AI service is not configured' });
  try {
    const { stats } = req.body;
    if (!stats) return res.status(400).json({ message: 'Stats data is required' });

    const prompt = `You are an executive AI assistant for a task management platform.
    Analyze the following workspace statistics and provide a concise, 2-sentence executive summary.
    Focus on what is going well and what needs attention. Do not use markdown, just plain text.
    
    Stats:
    Total Tasks: ${stats.totalTasks}
    In Progress: ${stats.inProgressTasks}
    Done: ${stats.doneTasks}
    Overdue: ${stats.overdueTasks}
    Projects: ${stats.projectsCount || 'N/A'}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    });

    const text = completion.choices[0]?.message?.content;
    res.json({ summary: text });
  } catch (error) {
    console.error("AI Summary Error:", error);
    res.status(500).json({ message: 'Failed to generate AI summary' });
  }
};

const generateTasksFromProject = async (req, res) => {
  if (!groq) return res.status(503).json({ message: 'AI service is not configured' });
  try {
    const { title, description, projectId } = req.body;
    
    if (req.workspaceRole !== 'Admin') {
        return res.status(403).json({ message: 'Only Admins can auto-generate tasks' });
    }
    
    const prompt = `You are a project manager AI. Given the following project title and description, break it down into exactly 5 logical, actionable tasks.
    Return ONLY a JSON object with a single key "tasks" containing an array of objects.
    Each object in the array must have exactly these keys:
    "title" (string, short actionable title)
    "description" (string, 1-2 sentences explaining what needs to be done)
    
    Project Title: ${title}
    Project Description: ${description}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' }
    });

    let text = completion.choices[0]?.message?.content;
    const parsedData = JSON.parse(text);
    const generatedTasks = parsedData.tasks || [];

    // Automatically save them to the DB
    const createdTasks = [];
    for (const t of generatedTasks) {
        const task = new Task({
            title: t.title || 'Untitled Task',
            description: t.description || 'No description',
            project: projectId,
            workspace: req.workspaceId,
            status: 'To Do'
        });
        await task.save();
        createdTasks.push(task);
    }

    res.json(createdTasks);
  } catch (error) {
    console.error("AI Task Generation Error:", error);
    res.status(500).json({ message: 'Failed to generate tasks using AI' });
  }
};

const enhanceTaskDescription = async (req, res) => {
  if (!groq) return res.status(503).json({ message: 'AI service is not configured' });
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
        return res.status(400).json({ message: 'Text is required for enhancement' });
    }

    const prompt = `You are a professional project manager. Take the following sloppy or short task description and rewrite it into a clear, professional, and actionable task description. Do not add made-up technical details, just structure it well (e.g., Goal, Action Items). Keep it under 100 words. Do not use heavy markdown, simple text with dashes is fine.
    
    Original Description: "${text}"`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    });

    const enhancedText = completion.choices[0]?.message?.content;
    res.json({ enhancedText: enhancedText ? enhancedText.trim() : '' });
  } catch (error) {
    console.error("AI Description Enhancement Error:", error);
    res.status(500).json({ message: 'Failed to enhance description using AI' });
  }
};

module.exports = { generateDashboardSummary, generateTasksFromProject, enhanceTaskDescription };
