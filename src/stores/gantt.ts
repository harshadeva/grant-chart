import { ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { addDays, isAfter, isBefore, parseISO } from 'date-fns'

export interface TeamMember {
  id: string
  name: string
  color: string
}

export interface Task {
  id: string
  name: string
  duration: number
  startDate: string | null
  dependencyId: string | null
  teamMemberId: string | null
}

export function useGanttStore() {
  // Initialize from localStorage if available
  const savedData = localStorage.getItem('ganttData')
  const initialData = savedData ? JSON.parse(savedData) : { tasks: [], teamMembers: [] }
  
  const tasks = ref<Task[]>(initialData.tasks || [])
  const teamMembers = ref<TeamMember[]>(initialData.teamMembers || [])

  // Watch for changes and save to localStorage
  watch(
    [tasks, teamMembers],
    () => {
      localStorage.setItem('ganttData', JSON.stringify({
        tasks: tasks.value,
        teamMembers: teamMembers.value
      }))
    },
    { deep: true }
  )

  // Team member methods
  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    teamMembers.value.push({
      ...member,
      id: uuidv4()
    })
  }

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    const index = teamMembers.value.findIndex(m => m.id === id)
    if (index !== -1) {
      teamMembers.value[index] = {
        ...teamMembers.value[index],
        ...updates
      }
    }
  }

  const deleteTeamMember = (id: string) => {
    teamMembers.value = teamMembers.value.filter(m => m.id !== id)
    // Remove team member from tasks
    tasks.value = tasks.value.map(task => ({
      ...task,
      teamMemberId: task.teamMemberId === id ? null : task.teamMemberId
    }))
  }

  // Task methods
  const addTask = (task: Omit<Task, 'id'>) => {
    tasks.value.push({
      ...task,
      id: uuidv4()
    })
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value[index] = {
        ...tasks.value[index],
        ...updates
      }
    }
  }

  const deleteTask = (id: string) => {
    tasks.value = tasks.value.filter(t => t.id !== id)
    // Update dependencies
    tasks.value = tasks.value.map(task => ({
      ...task,
      dependencyId: task.dependencyId === id ? null : task.dependencyId
    }))
  }

  // Computed properties
  const sortedTasks = computed(() => {
    return [...tasks.value].sort((a, b) => {
      const aStart = getTaskStartDate(a)
      const bStart = getTaskStartDate(b)
      if (!aStart || !bStart) return 0
      return isBefore(parseISO(aStart), parseISO(bStart)) ? -1 : 1
    })
  })

  const timelineStartDate = computed(() => {
    const dates = tasks.value
      .map(task => getTaskStartDate(task))
      .filter((date): date is string => date !== null)
      .map(date => parseISO(date))

    return dates.length > 0 ? dates.reduce((a, b) => (isBefore(a, b) ? a : b)) : new Date()
  })

  // Helper functions
  const getTaskStartDate = (task: Task): string | null => {
    if (task.startDate) return task.startDate
    if (!task.dependencyId) return null

    const dependentTask = tasks.value.find(t => t.id === task.dependencyId)
    if (!dependentTask) return null

    const dependentEndDate = getTaskEndDate(dependentTask)
    if (!dependentEndDate) return null

    return dependentEndDate
  }

  const getTaskEndDate = (task: Task): string | null => {
    const startDate = getTaskStartDate(task)
    if (!startDate) return null

    return addDays(parseISO(startDate), task.duration).toISOString()
  }

  // Data import/export
  const loadData = (data: { tasks: Task[], teamMembers: TeamMember[] }) => {
    tasks.value = data.tasks
    teamMembers.value = data.teamMembers
  }

  const exportData = () => ({
    tasks: tasks.value,
    teamMembers: teamMembers.value
  })

  return {
    tasks: computed(() => tasks.value),
    teamMembers: computed(() => teamMembers.value),
    sortedTasks,
    timelineStartDate,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addTask,
    updateTask,
    deleteTask,
    getTaskStartDate,
    getTaskEndDate,
    loadData,
    exportData
  }
} 