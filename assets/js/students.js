$(document).ready(function () {
  let studentsData = []; // store all students
  let currentPage = 1;
  const rowsPerPage = 5;
  let editingStudentId = null;

  const $studentsTable = $("#studentsTable");
  const $searchInput = $("#searchStudentInput");
  const $paginationList = $("#studentPaginationList");

  // ===============================
  // Render Students Table
  // ===============================
  function renderStudentTable(data) {
    $studentsTable.empty();

    if (!data.length) {
      $studentsTable.append(`
        <tr>
          <td colspan="6" class="text-center py-4">No students found.</td>
        </tr>
      `);
      $("#prevStudentPage, #nextStudentPage").hide();
      return;
    }

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = data.slice(start, end);

    $.each(pageData, function (_, student) {
      $studentsTable.append(`
        <tr>
          <td class="py-3 pr-5 whitespace-nowrap sm:pr-6">
            <span class="text-theme-sm font-medium text-gray-700 dark:text-gray-400">
              ${student.first_name} ${student.last_name}
            </span>
          </td>

          <td class="px-5 py-3 whitespace-nowrap sm:px-6">
            <span class="text-theme-sm text-gray-700 dark:text-gray-400">
              ${student.student_id}
            </span>
          </td>

          <td class="px-5 py-3 whitespace-nowrap sm:px-6">
            <span class="text-theme-sm text-gray-700 dark:text-gray-400">
              ${student.classroom}
            </span>
          </td>

          <td class="px-5 py-3 whitespace-nowrap sm:px-6">
            <span class="text-theme-sm text-gray-700 dark:text-gray-400">
              ${student.birthday}
            </span>
          </td>

          <td class="px-5 py-3 whitespace-nowrap sm:px-6">
            <span class="text-theme-sm text-gray-700 dark:text-gray-400">
              ${student.gender}
            </span>
          </td>
<td class="px-5 py-3 whitespace-nowrap sm:px-6">
                          <div class="flex items-center justify-center">
                            <div x-data="dropdown()" class="relative">
                              <button
                                @click="toggle"
                                class="text-gray-500 dark:text-gray-400"
                              >
                                <svg
                                  class="fill-current"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M5.99902 10.245C6.96552 10.245 7.74902 11.0285 7.74902 11.995V12.005C7.74902 12.9715 6.96552 13.755 5.99902 13.755C5.03253 13.755 4.24902 12.9715 4.24902 12.005V11.995C4.24902 11.0285 5.03253 10.245 5.99902 10.245ZM17.999 10.245C18.9655 10.245 19.749 11.0285 19.749 11.995V12.005C19.749 12.9715 18.9655 13.755 17.999 13.755C17.0325 13.755 16.249 12.9715 16.249 12.005V11.995C16.249 11.0285 17.0325 10.245 17.999 10.245ZM13.749 11.995C13.749 11.0285 12.9655 10.245 11.999 10.245C11.0325 10.245 10.249 11.0285 10.249 11.995V12.005C10.249 12.9715 11.0325 13.755 11.999 13.755C12.9655 13.755 13.749 12.9715 13.749 12.005V11.995Z"
                                    fill=""
                                  />
                                </svg>
                              </button>
                              <div
                                x-show="open"
                                @click.outside="open = false"
                                class="shadow-theme-lg dark:bg-gray-dark fixed w-40 space-y-1 rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-800"
                                x-ref="dropdown"
                              >
                                <button
                                data-id="${student.id}"
                                  class="editStudentBtn text-theme-xs flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                >
                                  Edit
                                </button>
                                <button
                                data-id="${student.id}"
                                  class="deleteStudentBtn text-theme-xs flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
          
        </tr>
      `);
    });

    renderStudentPagination(data);
  }

  // ===============================
  // Pagination
  // ===============================
  function renderStudentPagination(data) {
    $paginationList.empty();
    const totalPages = Math.ceil(data.length / rowsPerPage);

    for (let i = 1; i <= totalPages; i++) {
      const activeClass =
        i === currentPage
          ? "bg-brand-500/[0.08] text-brand-500"
          : "text-gray-700 dark:text-gray-400";

      $paginationList.append(`
        <li>
          <a href="#"
             class="${activeClass} flex h-10 w-10 items-center justify-center rounded-lg font-medium hover:bg-brand-500/[0.08] hover:text-brand-500">
            ${i}
          </a>
        </li>
      `);
    }

    $paginationList.find("a").on("click", function (e) {
      e.preventDefault();
      currentPage = parseInt($(this).text());
      renderStudentTable(filteredStudents());
    });

    currentPage <= 1
      ? $("#prevStudentPage").hide()
      : $("#prevStudentPage").show();
    currentPage >= totalPages
      ? $("#nextStudentPage").hide()
      : $("#nextStudentPage").show();
  }

  // ===============================
  // Search Filter
  // ===============================
  function filteredStudents() {
    const query = ($searchInput.val() || "").toLowerCase();

    return studentsData.filter((s) => {
      if (!s) return false;

      const fullName =
        `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
      const username = (s.username || "").toLowerCase();

      return fullName.includes(query) || username.includes(query);
    });
  }

  // ===============================
  // Search Input
  // ===============================
  $searchInput.on("input", function () {
    currentPage = 1;
    renderStudentTable(filteredStudents());
  });

  // ===============================
  // Load Section
  // ===============================
  function loadClassrooms(selectId) {
    database.ref("classrooms").once("value", function (snapshot) {
      const classrooms = snapshot.val();
      if (classrooms) {
        $(selectId).empty();
        $.each(classrooms, function (id, classroom) {
          $(selectId).append(`
            <option value="${classroom.classroom_name}">
              ${classroom.classroom_name}
            </option>
          `);
        });
      }
    });
  }

  loadClassrooms("#classroom"); // Add student modal
  loadClassrooms("#editClassroom"); // Edit student modal
  loadClassrooms("#uploadExcelClassroom"); // Upload Excel modal
  // ===============================
  // Load Students from Firebase
  // ===============================
  database.ref("users").on("value", function (snapshot) {
    const users = snapshot.val();
    studentsData = [];

    if (users) {
      $.each(users, function (id, user) {
        if (user.role === "student") {
          studentsData.push({ id, ...user });
        }
      });
    }

    currentPage = 1;
    renderStudentTable(filteredStudents());
  });

  // ===============================
  // Pagination Buttons
  // ===============================
  $("#prevStudentPage").on("click", function () {
    if (currentPage > 1) {
      currentPage--;
      renderStudentTable(filteredStudents());
    }
  });

  $("#nextStudentPage").on("click", function () {
    const totalPages = Math.ceil(filteredStudents().length / rowsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderStudentTable(filteredStudents());
    }
  });

  // ===============================
  // Delete Student
  // ===============================
  $("#studentsTable").on("click", ".deleteStudentBtn", function () {
    const studentId = $(this).data("id");

    database.ref("users/" + studentId).remove((error) => {
      if (error) console.log("Delete failed", error);
      else console.log("Student deleted");
    });
  });

  // ===============================
  // Add Student
  // ===============================
  $("#addStudentBtn").click(function () {
    const firstName = String($("#firstName").val()).trim();
    const lastName = String($("#lastName").val()).trim();
    const studentId = String($("#studentId").val()).trim();
    const email = String($("#email").val()).trim();
    const school = String($("#school").val()).trim();

    if (!firstName || !lastName || !studentId || !email || !school) {
      alert("Please fill in all required fields.");
      return;
    }
    const data = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      school: school,
      student_id: studentId,
      birthday: String($("#birthday").val()),
      classroom: String($("#classroom").val()),
      gender: String($("#gender").val()),
      password: `${lastName}${studentId.slice(-4)}`,
      role: "student",
    };

    firebase
      .database()
      .ref("users")
      .push(data)
      .then(() => {
        // reset fields
        $("#firstName").val("");
        $("#lastName").val("");
        $("#studentId").val("");
        $("#birthday").val("");
        $("#gender").prop("selectedIndex", 0);
        $("#classroom").prop("selectedIndex", 0);

        $("#addStudentModal").hide();
      })
      .catch((error) => {
        console.error("Data could not be saved.", error);
      });
  });

  // ===============================
  // Edit Student
  // ===============================
  $("#studentsTable").on("click", ".editStudentBtn", function () {
    editingStudentId = $(this).data("id");
    const student = studentsData.find((s) => s.id === editingStudentId);
    if (!student) return;

    // Fill modal inputs with current student data
    $("#editFirstName").val(student.first_name);
    $("#editLastName").val(student.last_name);
    $("#editStudentId").val(student.student_id);
    $("#editBirthday").val(student.birthday);
    $("#editGender").val(student.gender);
    $("#editEmail").val(student.email);
    $("#editSchool").val(student.school).change();

    // Load classrooms and select current one
    database.ref("classrooms").once("value", function (snapshot) {
      const classrooms = snapshot.val();
      if (classrooms) {
        $("#editClassroom").empty();
        $.each(classrooms, function (id, classroom) {
          const selected =
            classroom.classroom_name === student.classroom ? "selected" : "";
          $("#editClassroom").append(`
            <option value="${classroom.classroom_name}" ${selected}>
              ${classroom.classroom_name}
            </option>
          `);
        });
      }
    });

    $("#editStudentModal").show();
  });

  $("#saveEditStudentBtn").click(function () {
    const updatedData = {
      first_name: $("#editFirstName").val().trim(),
      last_name: $("#editLastName").val().trim(),
      student_id: $("#editStudentId").val().trim(),
      birthday: $("#editBirthday").val(),
      classroom: $("#editClassroom").val(),
      gender: $("#editGender").val(),
      email: $("#editEmail").val().trim(),
      school: $("#editSchool").val().trim(),
    };

    if (!editingStudentId) return;

    firebase
      .database()
      .ref("users/" + editingStudentId)
      .update(updatedData)
      .then(() => {
        $("#editStudentModal").hide();
        editingStudentId = null;
        renderStudentTable(filteredStudents()); // refresh table
        console.log("Student updated successfully");
      })
      .catch((error) => {
        console.error("Update failed:", error);
      });
  });

  $("#cancelEditStudentBtn").click(function () {
    $("#editStudentModal").hide();
    editingStudentId = null;
  });

  database.ref("schools").on("value", function (snapshot) {
    const schools = snapshot.val();
    console.log(schools);
    if (schools) {
      $.each(schools, function (id, school) {
        var option = `<option value="${school.school_name}" class="text-gray-700 dark:bg-gray-900 dark:text-gray-400" > ${school.school_name} </option>`;
        $("#school").append(option);
        $("#editSchool").append(option);

        $("#uploadExcelSchool").append(option);
      });
    }
  });
  $("#closeModalEditStudent").click(function () {
    $("#editStudentModal").hide();
    editingStudentId = null;
  });
  $("#uploadStudentsBtn").click(function () {
    $("#uploadStudentsModal").removeClass("hidden");
  });

  $(".modal-close-btn").click(function () {
    $("#uploadStudentsModal").addClass("hidden");
  });

  $("#insertStudentBtn").click(function () {});

  var students = [];
  var classroomName = "";

  $("#excelFile").on("change", function (e) {
    var file = e.target.files[0];
    var reader = new FileReader();

    reader.onload = function (e) {
      var data = new Uint8Array(e.target.result);
      var workbook = XLSX.read(data, { type: "array" });

      var sheetName = workbook.SheetNames[0];
      var sheet = workbook.Sheets[sheetName];

      // ✅ Get classroom from B1
      classroomName = sheet["B1"].v;

      // ✅ Convert sheet to JSON starting from row 2
      students = XLSX.utils.sheet_to_json(sheet, {
        range: 0, // skip first row (Classroom row)
      });

      console.log("Classroom:", classroomName);
      console.log("Students:", students);

      alert("Excel Loaded Successfully!");
    };

    reader.readAsArrayBuffer(file);
  });

  $("#insertStudentBtn").on("click", function () {
    const classroom = $("#uploadExcelClassroom").val();
    const school = $("#uploadExcelSchool").val();
    if (!classroom) {
      alert("Please select a classroom.");
      return;
    }
    if (!school) {
      alert("Please select a school.");
      return;
    }
    if (!students.length) {
      alert("Please upload an Excel file first.");
      return;
    }
    students.forEach((student) => {
      const data = {
        first_name: student["First Name"] || "",
        last_name: student["Last Name"] || "",
        email: student["Email"] || "",
        school: school,
        student_id: student["Student Id"] || "",
        birthday: formatExcelDate(student["Birthday"]) || "",
        classroom: classroom,
        gender: student["Gender"] || "",
        password: `${student["Last Name"]}${String(student["Student Id"] || "").slice(-4)}`,
        role: "student",
      };
      firebase
        .database()
        .ref("users")
        .push(data)
        .then(() =>
          console.log(`Added student: ${data.first_name} ${data.last_name}`),
        )
        .catch((error) => console.error("Error adding student:", error));
    });
    alert("Students inserted successfully!");
    $("#uploadStudentsModal").addClass("hidden");
    $("#excelFile").val("");
    $("#uploadExcelClassroom").prop("selectedIndex", 0);
    $("#uploadExcelSchool").prop("selectedIndex", 0);
  });
  function formatExcelDate(serial) {
    const utc_days = serial - 25569;
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    return date_info.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }
});
