<template>
  <div class="container mt-4">
    <div>
      <vue-good-table
        :columns="tableColumns"
        :rows="employees"
        :search-options="{
          enabled: true,
          placeholder: 'Search Employee',
        }"
        :pagination-options="{ enabled: true }"
      >
        <template #table-row="props">
          <span v-if="props.column.field === 'actions'">
            <button class="btn" @click="editEmployee(props.row)">
              <i class="fas fa-edit text-primary"></i>
            </button>
            <button class="btn" @click="showDeleteModal(props.row)">
              <i class="fas fa-trash-alt text-danger"></i>
            </button>
          </span>
        </template>
      </vue-good-table>
    </div>

    <!-- Confirmation Modal -->
    <AppModal
      v-if="showModal"
      :title="modalTitle"
      :action="modalAction"
      @confirm="deleteEmployee(confirmEmployee._id)"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps, watch } from "vue";

import "vue-good-table-next/dist/vue-good-table-next.css";
import { VueGoodTable } from "vue-good-table-next";
import axiosInstance from "@/interceptors/interceptors";
import AppModal from "@/components/AppModal.vue";
const employees = ref([]);

const showModal = ref(false);
const confirmEmployee = ref(null);
const tableColumns = ref([]);
const modalTitle = ref("Are you sure you want to delete this employee?");
const modalAction = ref("Delete");
const formatDate = (value) => {
  if (value) {
    const date = new Date(value);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDate = `${day < 10 ? "0" + day : day}-${
      month < 10 ? "0" + month : month
    }-${year}`;
    return formattedDate;
  }
  return "";
};
const showDeleteModal = (employee) => {
  confirmEmployee.value = employee;
  showModal.value = true;
};

const cancelDelete = () => {
  confirmEmployee.value = null;
  showModal.value = false;
};

const emits = defineEmits([
  "showForm",
  "editingEmployee",
  "editedEmployee",
  "isEditDone",
]);

const props = defineProps({
  isEditDone: Boolean,
});

// CRUD
const fetchEmployees = async () => {
  try {
    const response = await axiosInstance.get("/employees");

    const data = response.data;
    console.log("Fetched Employees:", data);

    employees.value = data;

    if (data.length > 0) {
      const sampleEmployee = data[0];
      const keys = Object.keys(sampleEmployee);
      const filteredKeys = keys.filter((key) => key !== "_id");

      tableColumns.value = [
        ...filteredKeys.map((key) => ({
          label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
          field: key,

          formatFn: key === "dob" ? formatDate : undefined,
        })),
        {
          label: "Actions",
          field: "actions",
        },
      ];
    }
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
};

const fetchOnEdit = () => {
  fetchEmployees();
  emits("isEditDone", false);
};

watch(
  () => props.isEditDone,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      fetchOnEdit();
    }
  }
);

const editEmployee = (employee) => {
  emits("editingEmployee", true);
  emits("showForm", true);
  emits("editedEmployee", { ...employee });
};

const deleteEmployee = async (employeeId) => {
  try {
    const response = await axiosInstance.delete(`/employees/${employeeId}`);
    if (response.status === 200) {
      showModal.value = false;
      fetchEmployees();
    } else {
      console.error("Error deleting employee:", response.statusText);
    }
  } catch (error) {
    console.error("Error deleting employee:", error);
  }
};

onMounted(fetchEmployees);
</script>

<style scoped></style>
