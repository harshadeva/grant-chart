<template>
  <div class="team-members">
    <div class="team-members-header">
      <h2>Team Members</h2>
      <button class="btn btn-primary add-member-btn" @click="showAddModal = true">
        <span class="icon">+</span>
        Add Member
      </button>
    </div>

    <div class="team-members-list">
      <div v-for="member in teamMembers" :key="member.id" class="team-member-item">
        <div class="member-info">
          <div class="member-avatar" :style="{ backgroundColor: member.color }">
            {{ getInitials(member.name) }}
          </div>
          <div class="member-details">
            <span class="member-name">{{ member.name }}</span>
            <div class="member-tasks">
              {{ getAssignedTasksCount(member.id) }} tasks assigned
            </div>
          </div>
        </div>
        <div class="member-actions">
          <button class="action-btn edit-btn" @click="editMember(member)" title="Edit member">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="action-btn delete-btn" @click="deleteMember(member.id)" title="Delete member">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingMember" class="modal-overlay">
      <div class="modal-backdrop" @click="closeModal"></div>
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingMember ? 'Edit' : 'Add' }} Team Member</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="memberName">Name</label>
            <input
              id="memberName"
              v-model="memberForm.name"
              type="text"
              placeholder="Enter member name"
              required
            >
          </div>

          <div class="form-group">
            <label for="memberColor">Color</label>
            <div class="color-picker-wrapper">
              <input
                id="memberColor"
                v-model="memberForm.color"
                type="color"
                required
              >
              <div class="color-presets">
                <div
                  v-for="color in colorPresets"
                  :key="color"
                  class="color-preset"
                  :style="{ backgroundColor: color }"
                  @click="memberForm.color = color"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" @click="saveMember">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGanttStore } from '../stores/gantt'
import type { TeamMember } from '../stores/gantt'

const store = useGanttStore()
const teamMembers = computed(() => store.teamMembers.value)

const showAddModal = ref(false)
const editingMember = ref<TeamMember | null>(null)
const memberForm = ref({
  name: '',
  color: '#4A90E2'
})

const colorPresets = [
  '#4A90E2', // Blue
  '#50E3C2', // Turquoise
  '#F5A623', // Orange
  '#D0021B', // Red
  '#7ED321', // Green
  '#9013FE', // Purple
  '#BD10E0', // Pink
  '#4A4A4A', // Dark Gray
]

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getAssignedTasksCount = (memberId: string) => {
  return store.tasks.value.filter(task => task.teamMemberId === memberId).length
}

const editMember = (member: TeamMember) => {
  editingMember.value = member
  memberForm.value = {
    name: member.name,
    color: member.color
  }
}

const deleteMember = (id: string) => {
  if (confirm('Are you sure you want to delete this team member?')) {
    store.deleteTeamMember(id)
  }
}

const saveMember = () => {
  if (!memberForm.value.name) return

  if (editingMember.value) {
    store.updateTeamMember(editingMember.value.id, memberForm.value)
  } else {
    store.addTeamMember(memberForm.value)
  }

  closeModal()
}

const closeModal = () => {
  showAddModal.value = false
  editingMember.value = null
  memberForm.value = {
    name: '',
    color: '#4A90E2'
  }
}
</script>

<style lang="scss" scoped>
.team-members {
  padding: 1.5rem;
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);

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

    .add-member-btn {
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
      
      .icon {
        font-size: 1.25rem;
        line-height: 1;
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

  &-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
    flex: 1;
  }
}

.team-member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }

  .member-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .member-avatar {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: white;
    font-size: 0.875rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .member-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    .member-name {
      font-weight: 500;
      color: #1e293b;
    }

    .member-tasks {
      font-size: 0.75rem;
      color: #64748b;
    }
  }

  .member-actions {
    display: flex;
    gap: 0.5rem;
  }
}

.action-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 6px;
  color: #64748b;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
    color: #1e293b;
  }

  &.edit-btn:hover {
    color: var(--primary-color);
  }

  &.delete-btn:hover {
    color: var(--error-color);
  }

  svg {
    display: block;
  }
}

.color-picker-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  input[type="color"] {
    width: 100%;
    height: 40px;
    padding: 0;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;

    &::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    &::-webkit-color-swatch {
      border: none;
      border-radius: 4px;
    }
  }

  .color-presets {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;

    .color-preset {
      width: 24px;
      height: 24px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 2px solid transparent;

      &:hover {
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px var(--shadow-color);
  z-index: 1;

  .modal-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);

    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-dark);
    }

    .close-btn {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      font-size: 1.5rem;
      color: var(--text-dark);
    }
  }

  .modal-body {
    padding: 1rem;

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: var(--text-dark);
      }

      input[type="text"] {
        background-color: #f8fafc;
        border: 1px solid var(--border-color);
        padding: 0.75rem;
        border-radius: 6px;
        font-size: 0.875rem;
        transition: all 0.2s ease;

        &:focus {
          background-color: white;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }
      }
    }
  }

  .modal-footer {
    padding: 1rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;

    .btn {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background-color: var(--primary-hover);
        color: white;
      }
    }

    .btn-primary {
      background-color: var(--primary-color);
      color: white;
    }
  }
}
</style> 