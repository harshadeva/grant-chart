<template>
  <div class="app">
    <header class="header">
      <h1>Vue 3 Gantt Chart</h1>
      <div class="header-actions">
        <button @click="exportData">Export Data</button>
      </div>
    </header>
    
    <main class="main-content">
      <div class="sidebar">
        <TeamMembers />
      </div>
      
      <div class="gantt-container">
        <GanttChart />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import TeamMembers from './components/TeamMembers.vue'
import GanttChart from './components/GanttChart.vue'
import { useGanttStore } from './stores/gantt'

const store = useGanttStore()

const exportData = () => {
  const data = store.exportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'gantt-data.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style lang="scss">
:root {
  --primary-color: #4A90E2;
  --primary-hover: #357abd;
  --secondary-color: #6c757d;
  --secondary-hover: #545b62;
  --border-color: #e9ecef;
  --light-color: #f8f9fa;
  --error-color: #ff4444;
  --error-hover: #ff1a1a;
  --header-bg: #ffffff;
  --task-hover: #f1f5f9;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --text-dark: #1e293b;
  --text-dark-hover: #0f172a;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8fafc;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  
  .header {
    padding: 1rem 2rem;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #212529;
    }
    
    .header-actions {
      button {
        padding: 0.5rem 1rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
          background: #0056b3;
        }
      }
    }
  }
  
  .main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
    
    .sidebar {
      width: 300px;
      border-right: 1px solid #e9ecef;
      overflow-y: auto;
    }
    
    .gantt-container {
      flex: 1;
      overflow: auto;
      padding: 1rem;
    }
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
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
</style> 