# Vue 3 Gantt Chart

A modern and responsive Gantt chart application built with Vue 3, TypeScript, and SCSS.

## Features

- 📊 Interactive Gantt chart visualization
- 👥 Team member management with color coding
- 📝 Task management with dependencies
- 💾 Local storage persistence
- 📤 Data export functionality
- 🎨 Clean and modern UI
- 📱 Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Usage

### Team Members

- Click "Add Member" to create a new team member
- Assign a name and color to each team member
- Edit or delete team members using the respective buttons
- Team member colors will be reflected in their assigned tasks

### Tasks

- Click "Add Task" to create a new task
- Set task name, duration, and optionally assign to a team member
- Choose a dependency if the task depends on another task
- If no dependency is set, you can choose a start date
- Click on any task in the timeline to edit or delete it

### Timeline

- The timeline automatically adjusts based on task durations
- Dependencies are shown with arrows connecting tasks
- Hover over tasks to see detailed information
- The timeline scrolls horizontally if needed

### Data Management

- All data is automatically saved to localStorage
- Click "Export Data" to download the current state as JSON
- Import data by replacing the localStorage content

## Technologies

- Vue 3 (Composition API)
- TypeScript
- SCSS
- date-fns
- vue-select
- Vite 