<template>
  <div class="gantt-chart">
    <div class="gantt-header">
      <h2>Tasks</h2>
      <button class="btn btn-primary" @click="showAddModal = true">Add Task</button>
    </div>

    <div class="gantt-content">
      <svg class="dependency-arrows">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--secondary-color)" />
          </marker>
        </defs>
        <path
          v-for="task in tasksWithDependencies"
          :key="task.id + '-dep'"
          :d="getDependencyPath(task)"
          class="dependency-path"
          marker-end="url(#arrowhead)"
        />
      </svg>
      <div class="gantt-timeline">
        <div class="timeline-header">
          <div class="task-info-header">Task Info</div>
          <div class="timeline-dates-wrapper">
            <div class="timeline-dates">
              <div
                v-for="date in timelineDates"
                :key="date.toISOString()"
                class="timeline-date"
              >
                {{ formatDate(date) }}
              </div>
            </div>
          </div>
        </div>

        <div class="timeline-body">
          <div class="task-info-column">
            <div
              v-for="task in sortedTasks"
              :key="task.id"
              class="task-info"
            >
              <span class="task-name">{{ task.name }}</span>
              <span class="task-duration">({{ task.hours || task.duration * 8 }} hours)</span>
            </div>
          </div>
          
          <div class="timeline-content" @scroll="handleScroll">
            <div class="date-grid-lines">
              <div
                v-for="(date, index) in timelineDates"
                :key="date.toISOString()"
                class="date-grid-line"
                :style="{
                  left: `${index * 100}px`,
                  height: '100%'
                }"
              ></div>
            </div>

            <div class="task-list">
              <div
                v-for="task in sortedTasks"
                :key="task.id"
                class="task-row"
                @click="editTask(task)"
              >
                <div class="timeline-grid">
                  <div
                    class="task-bar"
                    :style="getTaskBarStyle(task)"
                    :title="getTaskTooltip(task)"
                  >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Task Modal -->
    <div v-if="showAddModal || editingTask" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingTask ? 'Edit' : 'Add' }} Task</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="taskName">Name</label>
            <input
              id="taskName"
              v-model="taskForm.name"
              type="text"
              required
            >
          </div>

          <div class="form-group">
            <label for="taskHours">Estimation (hours)</label>
            <input
              id="taskHours"
              v-model.number="taskForm.hours"
              type="number"
              min="1"
              required
            >
            <span class="hours-to-days">≈ {{ hoursToExactDays(taskForm.hours).toFixed(1) }} days</span>
          </div>

          <div class="form-group">
            <label for="taskDependency">Dependency</label>
            <v-select
              v-model="taskForm.dependencyId"
              :options="availableDependencies"
              :reduce="task => task.id"
              label="name"
              :clearable="true"
            />
          </div>

          <div class="form-group">
            <label for="taskStartDate">Start Date</label>
            <input
              id="taskStartDate"
              v-model="taskForm.startDate"
              type="date"
              required
            >
          </div>

          <div class="form-group">
            <label for="taskTeamMember">Assigned To</label>
            <v-select
              v-model="taskForm.teamMemberId"
              :options="teamMembers"
              :reduce="member => member.id"
              label="name"
              :clearable="true"
              :searchable="true"
              placeholder="Select team member"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button
            v-if="editingTask"
            class="btn btn-danger"
            @click="deleteTask(editingTask.id)"
          >
            Delete
          </button>
          <div class="modal-actions">
            <button class="btn" @click="closeModal">Cancel</button>
            <button class="btn btn-primary" @click="saveTask">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format, addDays, parseISO, differenceInDays } from 'date-fns'
import { useGanttStore } from '../stores/gantt'
import type { Task, TeamMember } from '../stores/gantt'

const store = useGanttStore()
const sortedTasks = computed(() => store.sortedTasks.value)
const teamMembers = computed(() => {
  const members = store.teamMembers.value
  console.log('Team members loaded:', members) // Debug log
  return members
})

const showAddModal = ref(false)
const editingTask = ref<Task | null>(null)
const taskForm = ref({
  name: '',
  duration: 1,
  hours: 8, // Default to 8 hours
  startDate: new Date().toISOString().split('T')[0],
  dependencyId: null as string | null,
  teamMemberId: null as string | null
})

const timelineDates = computed(() => {
  const startDate = store.timelineStartDate.value
  const maxDuration = sortedTasks.value.reduce((total, task) => {
    const taskDuration = task.hours ? task.hours / 8 : task.duration
    return Math.max(total, differenceInDays(parseISO(store.getTaskEndDate(task)!), startDate) + taskDuration)
  }, 0)
  
  const dates = []
  for (let i = 0; i <= Math.ceil(maxDuration); i++) {
    dates.push(addDays(startDate, i))
  }
  
  return dates
})

const tasksWithDependencies = computed(() => {
  return sortedTasks.value.filter(task => task.dependencyId)
})

const getDependencyPath = (task: Task) => {
  // Check if task has a dependency, if not return empty string
  if (!task.dependencyId) return ''

  // Find the task that this task depends on
  const dependentTask = sortedTasks.value.find(t => t.id === task.dependencyId)
  if (!dependentTask) return ''
  console.log('Dependent task:', dependentTask );

  // Get the end date of dependent task and start date of current task
  const dependentEndDate = store.getTaskEndDate(dependentTask)
  const taskStartDate = store.getTaskStartDate(task)
  if (!dependentEndDate || !taskStartDate) return ''

  // Calculate days offset from timeline start for positioning
  const timelineStart = store.timelineStartDate.value
  const endOffset = differenceInDays(parseISO(dependentEndDate), timelineStart)
  const startOffset = differenceInDays(parseISO(taskStartDate), timelineStart)

  // Calculate starting position (end of first task)
  const startX = (endOffset + dependentTask.duration) * 100 // Multiply by 100 as each day is 100px wide
  const startY = sortedTasks.value.findIndex(t => t.id === dependentTask.id) * 50 + 25 // Each task row is 50px high, +25 for middle

  // Calculate end position (start of second task)
  const endX = startOffset * 100
  const endY = sortedTasks.value.findIndex(t => t.id === task.id) * 50 + 25

  // Calculate distances
  const dx = endX - startX // Horizontal distance between tasks
  const dy = endY - startY // Vertical distance between tasks

  // Define Bezier curve control points
  const cp1x = startX + 20    // First control point X: 20px right of start
  const cp1y = startY - 50    // First control point Y: 50px above start

  const cp2x = startX + 100   // Second control point X: 100px right of start
  const cp2y = startY - 50    // Second control point Y: 50px above start

  // Define end point
  const endPointX = startX + 120  // End point X: 120px right of start
  const endPointY = startY        // End point Y: same level as start

  // Return SVG path string using cubic Bezier curve
  // M = Move to starting point
  // C = Cubic Bezier curve with two control points and end point
  return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endPointX} ${endPointY}`
}

const availableDependencies = computed(() => {
  if (!editingTask.value) return sortedTasks.value
  return sortedTasks.value.filter(task => task.id !== editingTask.value?.id)
})

const formatDate = (date: Date) => {
  return format(date, 'MMM d')
}

// Add helper function to check for task overlaps
const isTaskOverlapping = (task: Task) => {
  if (!task.teamMemberId) return false

  return sortedTasks.value.some(otherTask => {
    // Skip if same task or different team member
    if (otherTask.id === task.id || otherTask.teamMemberId !== task.teamMemberId) {
      return false
    }

    const taskStartDate = store.getTaskStartDate(task)
    const otherStartDate = store.getTaskStartDate(otherTask)
    
    if (!taskStartDate || !otherStartDate) return false

    const taskStart = parseISO(taskStartDate)
    const otherStart = parseISO(otherStartDate)
    
    // Calculate end dates based on hours
    const taskHours = task.hours || task.duration * 8
    const otherHours = otherTask.hours || otherTask.duration * 8
    
    const taskEnd = addDays(taskStart, hoursToExactDays(taskHours))
    const otherEnd = addDays(otherStart, hoursToExactDays(otherHours))

    // Check if date ranges overlap
    return taskStart < otherEnd && taskEnd > otherStart
  })
}

// Update getTaskBarStyle to include overlap warning
const getTaskBarStyle = (task: Task) => {
  const startDate = store.getTaskStartDate(task)
  if (!startDate) return {}

  const start = parseISO(startDate)
  const timelineStart = store.timelineStartDate.value
  const offsetDays = differenceInDays(start, timelineStart)
  
  const hours = task.hours || task.duration * 8
  const exactDays = hoursToExactDays(hours)

  const teamMember = teamMembers.value.find(m => m.id === task.teamMemberId)
  const hasOverlap = isTaskOverlapping(task)
  const backgroundColor = teamMember ? teamMember.color : 'var(--primary-color)'

  return {
    left: `${offsetDays * 100}px`,
    width: `${exactDays * 100}px`,
    backgroundColor,
    border: hasOverlap ? '2px solid #ff4444' : 'none',
    boxShadow: hasOverlap ? '0 0 8px rgba(255, 68, 68, 0.5)' : 'none',
    zIndex: hasOverlap ? 2 : 1
  }
}

// Update getTaskTooltip to include overlap warning
const getTaskTooltip = (task: Task) => {
  const startDate = store.getTaskStartDate(task)
  if (!startDate) return task.name

  const start = format(parseISO(startDate), 'MMM d, yyyy')
  const end = format(addDays(parseISO(startDate), hoursToExactDays(task.hours || task.duration * 8)), 'MMM d, yyyy')
  const teamMember = teamMembers.value.find(m => m.id === task.teamMemberId)
  const hours = task.hours || task.duration * 8
  const exactDays = hoursToExactDays(hours)
  const hasOverlap = isTaskOverlapping(task)

  let tooltip = `${task.name}\nEstimation: ${hours} hours (${exactDays.toFixed(1)} days)\nStart: ${start}\nEnd: ${end}`
  if (teamMember) {
    tooltip += `\nAssigned to: ${teamMember.name}`
  }
  if (hasOverlap) {
    tooltip += '\n⚠️ Warning: Resource overallocation detected'
  }
  return tooltip
}

const editTask = (task: Task) => {
  editingTask.value = task
  const startDate = store.getTaskStartDate(task)
  taskForm.value = {
    name: task.name,
    duration: task.duration,
    hours: task.hours || task.duration * 8, // Convert days to hours if no hours set
    startDate: startDate ? startDate.split('T')[0] : new Date().toISOString().split('T')[0],
    dependencyId: task.dependencyId,
    teamMemberId: task.teamMemberId
  }
}

const deleteTask = (id: string) => {
  if (confirm('Are you sure you want to delete this task?')) {
    store.deleteTask(id)
    closeModal()
  }
}

const saveTask = () => {
  if (!taskForm.value.name || taskForm.value.hours < 1) return

  const taskData = {
    name: taskForm.value.name,
    hours: taskForm.value.hours,
    duration: hoursToExactDays(taskForm.value.hours), // Store exact days
    startDate: taskForm.value.startDate,
    dependencyId: taskForm.value.dependencyId,
    teamMemberId: taskForm.value.teamMemberId
  }

  if (editingTask.value) {
    store.updateTask(editingTask.value.id, taskData)
  } else {
    store.addTask(taskData)
  }

  closeModal()
}

const closeModal = () => {
  showAddModal.value = false
  editingTask.value = null
  taskForm.value = {
    name: '',
    duration: 1,
    hours: 8,
    startDate: new Date().toISOString().split('T')[0],
    dependencyId: null,
    teamMemberId: null
  }
}

// Add conversion helpers
const hoursToExactDays = (hours: number) => {
  return hours / 8 // Exact days (8 hours per workday)
}

const getTaskDurationInDays = (task: Task) => {
  return hoursToExactDays(task.hours || task.duration * 8)
}

// Add scroll handling
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  const dateHeader = document.querySelector('.timeline-dates') as HTMLElement
  if (dateHeader) {
    dateHeader.style.transform = `translateX(-${target.scrollLeft}px)`
  }
}
</script>

<style lang="scss" scoped>
.gantt-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 4px 6px var(--shadow-color);
  
  .gantt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: var(--header-bg);
    border-bottom: 1px solid var(--border-color);
    border-radius: 12px 12px 0 0;
    
    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-dark);
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &::before {
        content: '';
        display: block;
        width: 3px;
        height: 20px;
        background: var(--primary-color);
        border-radius: 2px;
      }
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 6px;
      transition: all 0.2s ease;

      &::before {
        content: '+';
        font-size: 1.25rem;
        line-height: 1;
        margin-right: 0.25rem;
      }

      &:hover {
        background: var(--primary-hover);
        transform: translateY(-1px);
        box-shadow: 0 4px 6px rgba(74, 144, 226, 0.2);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

.gantt-content {
  flex: 1;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 0 0 12px 12px;
  background: white;
  position: relative;
}

.dependency-arrows {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.dependency-path {
  fill: none;
  stroke: var(--secondary-color);
  stroke-width: 2px;
}

.gantt-timeline {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .timeline-header {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    background: var(--header-bg);
    position: sticky;
    top: 0;
    z-index: 2;
    
    .task-info-header {
      width: 200px;
      padding: 1rem;
      font-weight: 600;
      border-right: 1px solid var(--border-color);
      background: var(--header-bg);
      color: #1e293b;
    }
    
    .timeline-dates-wrapper {
      overflow: hidden;
      flex: 1;
      background: var(--header-bg);
      
      .timeline-dates {
        display: flex;
        min-width: fit-content;
        will-change: transform;
        
        .timeline-date {
          width: 100px;
          padding: 1rem;
          text-align: center;
          border-right: 1px solid var(--border-color);
          flex-shrink: 0;
          font-weight: 500;
          color: #64748b;
        }
      }
    }
  }
  
  .timeline-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
    background: white;

    .task-info-column {
      width: 200px;
      flex-shrink: 0;
      border-right: 1px solid var(--border-color);
      z-index: 1;
      background: white;

      .task-info {
        height: 60px;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        justify-content: center;
        transition: background-color 0.2s ease;
        
        &:hover {
          background-color: var(--task-hover);
        }
        
        .task-name {
          display: block;
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }
        
        .task-duration {
          font-size: 0.875rem;
          color: #64748b;
        }
      }
    }

    .timeline-content {
      flex: 1;
      overflow-x: auto;
      position: relative;
      
      .date-grid-lines {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        
        .date-grid-line {
          position: absolute;
          top: 0;
          width: 1px;
          height: 100%;
          background-color: #e2e8f0;
          opacity: 0.5;
        }
      }

      .task-list {
        position: relative;
        z-index: 1;
        min-width: fit-content;
        
        .task-row {
          height: 60px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background-color 0.2s ease;
          
          &:hover {
            background-color: var(--task-hover);
          }
          
          .timeline-grid {
            height: 100%;
            position: relative;
            
            .task-bar {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              height: 32px;
              border-radius: 6px;
              transition: all 0.2s ease;
              box-shadow: 0 2px 4px var(--shadow-color);

              &:hover {
                transform: translateY(-50%) scale(1.02);
                box-shadow: 0 4px 8px var(--shadow-color);
              }
            }
          }
        }
      }
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px var(--shadow-color);

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--header-bg);
    border-radius: 12px 12px 0 0;

    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #64748b;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.2s ease;

      &:hover {
        background-color: var(--task-hover);
        color: var(--text-dark-hover);
      }
    }
  }

  .modal-body {
    padding: 1.5rem;

    .form-group {
      margin-bottom: 1.25rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #1e293b;
      }

      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-size: 1rem;
        transition: all 0.2s ease;

        &:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }
      }

      .hours-to-days {
        margin-left: 0.5rem;
        color: #64748b;
        font-size: 0.875rem;
      }
    }
  }

  .modal-footer {
    display: flex;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    background-color: var(--light-color);
    border-top: 1px solid var(--border-color);
    border-radius: 0 0 12px 12px;

    .modal-actions {
      display: flex;
      gap: 0.75rem;
    }
  }
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px var(--shadow-color);
}

.btn-danger {
  background-color: var(--error-color);
  color: white;
}

.btn-danger:hover {
  background-color: var(--error-hover);
}

.modal-header {
  .close-btn {
    &:hover {
      background-color: var(--task-hover);
      color: var(--text-dark-hover);
    }
  }
}
</style> 