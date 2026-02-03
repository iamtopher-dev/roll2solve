$(document).ready(function () {
  let studentsData = []; // store all students
  let currentPage = 1;
  const rowsPerPage = 5;

  const $studentsTable = $("#studentsTable");
  const $searchInput = $("#searchStudentInput");
  const $paginationList = $("#studentPaginationList");

  // ===============================
  // Render Students Table
  // ===============================
  function renderStudentTable(data) {
    $studentsTable.empty();

    if (!data.length) {
      $studentsTable.append(
        `<tr>
          <td colspan="5" class="text-center py-4">No students found.</td>
        </tr>`,
      );
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
            <div class="flex justify-center">
              <button
                data-id="${student.id}"
                class="deleteStudentBtn text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
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

  //   Load Classroom
  database.ref("classrooms").on("value", function (snapshot) {
    const classrooms = snapshot.val();

    if (classrooms) {
      $.each(classrooms, function (id, classroom) {
        $("#classroom").append(` <option
                              value="${classroom.classroom_name}"
                              class="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                            >
                              ${classroom.classroom_name}
                            </option>`);
      });
    }
  });

  // ===============================
  // Load Students from Firebase
  // ===============================
  database.ref("users").on("value", function (snapshot) {
    const users = snapshot.val();
    studentsData = [];

    if (users) {
      $.each(users, function (id, user) {
        if (user.role === "student") {
          studentsData.push({
            id,
            ...user,
          });
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

  $("#addStudentBtn").click(function () {
    const firstName = String($("#firstName").val()).trim();
    const lastName = String($("#lastName").val()).trim();
    const studentId = String($("#studentId").val()).trim();

    const data = {
      first_name: firstName,
      last_name: lastName,
      student_id: studentId, // stored as STRING
      birthday: String($("#birthday").val()),
      classroom: String($("#classroom").val()),
      gender: String($("#gender").val()),
      password: `${lastName}${studentId.slice(-4)}`, // force string concat
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

  database.ref("schools").on("value", function (snapshot) {
    const schools = snapshot.val();
    console.log(schools);
    if (schools) {
      $.each(schools, function (id, school) {
        $("#school").append(` <option
                              value="${school.school_name}"
                              class="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                            >
                              ${school.school_name}
                            </option>`);
      });
    }
  });
});
