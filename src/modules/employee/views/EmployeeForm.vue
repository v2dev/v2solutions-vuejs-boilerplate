<template>
  <div>
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center">
        <h4>Employee Dashboard</h4>
        <!-- Add Employee -->
        <button class="add-btn btn btn-primary" @click="showAddForm">
          Add
        </button>
      </div>
      <hr />
      <div class="content-wrapper">
        <div class="content">
          <!-- Form -->
          <div v-if="showForm" class="overlay">
            <div class="form-container">
              <form class="form form-focus" @submit.prevent="submitForm">
                <button @click="closeForm" class="close-button">
                  <i class="fa fa-times" aria-hidden="true"></i>
                </button>
                <!--  -->
                <div class="mb-3">
                  <label for="employeeName" class="form-label"
                    >Employee Name:</label
                  >
                  <input
                    type="text"
                    id="employeeName"
                    v-model="employeeName"
                    class="form-control"
                    @input="() => validateForm('employeeName')"
                  />
                  <div class="text-danger">{{ employeeNameError }}</div>
                </div>

                <div class="mb-3">
                  <label for="employeeEmail" class="form-label"
                    >Employee Email:</label
                  >
                  <input
                    type="email"
                    id="employeeEmail"
                    v-model="employeeEmail"
                    class="form-control"
                    @input="() => validateForm('employeeEmail')"
                  />
                  <div class="text-danger">{{ employeeEmailError }}</div>
                </div>

                <div class="mb-3">
                  <label for="employeeDOB" class="form-label"
                    >Date of Birth:</label
                  >
                  <input
                    type="date"
                    id="employeeDOB"
                    v-model="employeeDOB"
                    class="form-control"
                    @input="updateEmployeeDOBError"
                    :min="minDate"
                    :max="maxDate.toISOString().split('T')[0]"
                  />
                  <div class="text-danger">{{ employeeDOBError }}</div>
                </div>

                <div class="mb-3">
                  <label for="employeeDesignation" class="form-label"
                    >Designation:</label
                  >
                  <input
                    type="text"
                    id="employeeDesignation"
                    v-model="employeeDesignation"
                    class="form-control"
                    @input="() => validateForm('employeeDesignation')"
                  />
                  <div class="text-danger">{{ employeeDesignationError }}</div>
                </div>

                <div class="mb-3">
                  <label for="employeeEducation" class="form-label"
                    >Education:</label
                  >
                  <input
                    type="text"
                    id="employeeEducation"
                    v-model="employeeEducation"
                    class="form-control"
                    @input="() => validateForm('employeeEducation')"
                  />
                  <div class="text-danger">{{ employeeEducationError }}</div>
                </div>
                <p v-if="serverError" class="error-text">{{ serverError }}</p>
                <button type="submit" class="btn btn-primary">
                  {{ editingEmployee ? "Update Employee" : "Add Employee" }}
                </button>
              </form>
            </div>
          </div>
          <!-- Table -->
          <EmployeeTable
            @editingEmployee="handleEditingEmployee"
            @showForm="handleShowForm"
            @editedEmployee="handleEditedEmployee"
            @isEditDone="handleIsEditDone"
            :isEditDone="isEditDone"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

import EmployeeTable from "./EmployeeTable.vue";
import axiosInstance from "@/interceptors/interceptors";

const employees = ref([]);
const editingEmployee = ref(false);
const showForm = ref(false);
const editedEmployee = ref(null);
const employeeNameError = ref("");
const employeeEmailError = ref("");
const employeeDOBError = ref("");
const employeeDesignationError = ref("");
const employeeEducationError = ref("");
const isEditDone = ref(false);
const today = new Date();
const maxDate = new Date(
  today.getFullYear() - 18,
  today.getMonth(),
  today.getDate()
);
const minDate = "1930-01-01";

import {
  validateField,
  serverError,
  setErrorMessage,
} from "@/helpers/validation";

const handleEditingEmployee = (value) => {
  editingEmployee.value = value;
};

const handleShowForm = (value) => {
  showForm.value = value;
};

const handleEditedEmployee = (data) => {
  editedEmployee.value = data;
};

const handleIsEditDone = (data) => {
  isEditDone.value = data;
};

const newEmployee = ref({
  name: "",
  email: "",
  dob: "",
  designation: "",
  education: "",
});

const submitForm = async (event) => {
  event.preventDefault();
  validateForm();
  if (
    employeeNameError.value ||
    employeeEmailError.value ||
    employeeDOBError.value ||
    employeeDesignationError.value ||
    employeeEducationError.value
  ) {
    return;
  }
  if (editingEmployee.value) {
    updateEmployee();
  } else {
    addEmployee();
  }
};

// v-model for employee fields
const createComputedEmployeeField = (fieldName) => {
  return computed({
    get: () => {
      if (editingEmployee.value) {
        if (fieldName === "dob") {
          const dateOfBirth = editedEmployee.value[fieldName];
          return dateOfBirth
            ? new Date(dateOfBirth).toISOString().split("T")[0]
            : "";
        } else {
          return editedEmployee.value[fieldName];
        }
      } else {
        return newEmployee.value[fieldName];
      }
    },
    set: (value) => {
      if (editingEmployee.value) {
        editedEmployee.value[fieldName] = value;
      } else {
        newEmployee.value[fieldName] = value;
      }
    },
  });
};

const employeeName = createComputedEmployeeField("name");
const employeeEmail = createComputedEmployeeField("email");
const employeeDOB = createComputedEmployeeField("dob");
const employeeDesignation = createComputedEmployeeField("designation");
const employeeEducation = createComputedEmployeeField("education");

const showAddForm = () => {
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  setErrorMessage("");
  editedEmployee.value = {
    name: "",
    email: "",
    dob: "",
    designation: "",
    education: "",
  };
};

// CRUD

const addEmployee = async () => {
  try {
    const response = await axiosInstance.post("/employees", newEmployee.value);
    if (response.status === 200) {
      const data = response.data;

      if (data.error === "Email is already in used.") {
        setErrorMessage(data.error);
      } else {
        employees.value.push(data);
        newEmployee.value = {
          name: "",
          email: "",
          dob: "",
          designation: "",
          education: "",
        };
        showForm.value = false;
        isEditDone.value = true;
        setErrorMessage("");
      }
    } else {
      console.error("Error creating a new employee:", response.statusText);
    }
  } catch (error) {
    console.error("Error creating a new employee:", error);
  }
};

const updateEmployee = async () => {
  if (editedEmployee.value) {
    try {
      const response = await axiosInstance.put(
        `/employees/${editedEmployee.value._id}`,
        editedEmployee.value
      );
      if (response.status === 200) {
        showForm.value = false;
        editingEmployee.value = false;
        editedEmployee.value = null;
        isEditDone.value = true;
      } else {
        console.error("Error updating the employee:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating the employee:", error);
    }
  }
};
// Validations
const validateForm = (fieldName = null) => {
  if (fieldName) {
    switch (fieldName) {
      case "employeeName":
        employeeNameError.value = validateField(employeeName.value, "name");
        break;
      case "employeeEmail":
        employeeEmailError.value = validateField(employeeEmail.value, "email");
        break;
      case "employeeDOB":
        employeeDOBError.value = validateField(employeeDOB.value, "dob");
        break;
      case "employeeEducation":
        employeeEducationError.value = validateField(
          employeeEducation.value,
          "education"
        );
        break;
      case "employeeDesignation":
        employeeDesignationError.value = validateField(
          employeeDesignation.value,
          "designation"
        );
        break;
      default:
        break;
    }
  } else {
    employeeNameError.value = validateField(employeeName.value, "name");
    employeeEmailError.value = validateField(employeeEmail.value, "email");
    employeeDesignationError.value = validateField(
      employeeDesignation.value,
      "designation"
    );
    employeeEducationError.value = validateField(
      employeeEducation.value,
      "education"
    );
    employeeDOBError.value = validateField(employeeDOB.value, "dob");
  }
};
const updateEmployeeDOBError = () => {
  employeeDOBError.value = validateField(employeeDOB.value, "dob");
};

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
});

const handleOutsideClick = (event) => {
  const formContainer = document.querySelector(".form-focus");

  if (formContainer && !formContainer.contains(event.target)) {
    clearErrors();
  }
};

const clearErrors = () => {
  employeeNameError.value = "";
  employeeEmailError.value = "";
  employeeDOBError.value = "";
  employeeDesignationError.value = "";
  employeeEducationError.value = "";
  setErrorMessage("");
};
</script>

<style scoped>
@import "@/assets/styles/style.scss";
</style>
