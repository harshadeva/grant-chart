<template>
  <div class="team-members">
    <div class="team-members-header">
      <h2>Team Members</h2>
      <button class="btn btn-primary" @click="showAddModal = true">Add Member</button>
    </div>

    <div class="team-members-list">
      <div v-for="member in teamMembers" :key="member.id" class="team-member-item">
        <div class="member-info">
          <div class="member-color" :style="{ backgroundColor: member.color }"></div>
          <span class="member-name">{{ member.name }}</span>
        </div>
        <div class="member-actions">
          <button class="btn btn-primary" @click="editMember(member)">Edit</button>
          <button class="btn btn-danger" @click="deleteMember(member.id)">Delete</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingMember" class="modal-overlay" @click="closeModal">
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
              required
            >
          </div>

          <div class="form-group">
            <label for="memberColor">Color</label>
            <input
              id="memberColor"
              v-model="memberForm.color"
              type="color"
              required
            >
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
const teamMembers = computed(() => {
  const members = store.teamMembers.value
  console.log('Team members in TeamMembers component:', members)
  return members
})

const showAddModal = ref(false)
const editingMember = ref<TeamMember | null>(null)
const memberForm = ref({
  name: '',
  color: '#007bff'
})

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
    color: '#007bff'
  }
}
</script>

<style lang="scss" scoped>
.team-members {
  padding: 1rem;

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h2 {
      margin: 0;
    }
  }

  &-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}

.team-member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 4px;

  .member-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .member-color {
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }

  .member-actions {
    display: flex;
    gap: 0.5rem;
  }
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: var(--secondary-color);

  &:hover {
    color: var(--dark-color);
  }
}
</style> 