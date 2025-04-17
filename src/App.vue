<template>
  <div class="app">
    <header class="header">
      <div class="header-left">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 9.88L11.28 5L20.56 9.88L11.28 14.76L2 9.88Z" fill="var(--primary-color)" />
            <path d="M20.56 14.12L11.28 19L2 14.12" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <h1>TaskFlow</h1>
        </div>
        <nav class="nav-menu">
          <a href="#" class="nav-item active">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            Gantt Chart
          </a>
          <a href="#" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Team
          </a>
        </nav>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="exportData">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export
        </button>
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
    padding: 0.75rem 2rem;
    background: var(--header-bg);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 3px var(--shadow-color);
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 3rem;

      .logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        
        h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-dark);
          letter-spacing: -0.5px;
        }

        svg {
          display: block;
        }
      }

      .nav-menu {
        display: flex;
        gap: 1rem;

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          color: var(--secondary-color);
          text-decoration: none;
          font-weight: 500;
          border-radius: 6px;
          transition: all 0.2s ease;

          svg {
            stroke: currentColor;
          }

          &:hover {
            color: var(--text-dark);
            background: var(--task-hover);
          }

          &.active {
            color: var(--primary-color);
            background: rgba(74, 144, 226, 0.1);
          }
        }
      }
    }
    
    .header-actions {
      .btn-secondary {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        color: var(--secondary-color);
        background: white;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;

        svg {
          stroke: currentColor;
        }
        
        &:hover {
          color: var(--text-dark);
          border-color: var(--secondary-color);
          background: var(--task-hover);
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
      border-right: 1px solid var(--border-color);
      overflow-y: auto;
      background: white;
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