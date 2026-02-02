$(document).ready(function () {
  let teachersData = []; // store all teachers
  let currentPage = 1;
  const rowsPerPage = 5;

  const $teachersTable = $("#teachersTable");
  const $searchInput = $("#searchTeacherInput");
  const $paginationList = $("#teacherPaginationList");

  // ===============================
  // Render Teachers Table
  // ===============================
  function renderTeacherTable(data) {
    $teachersTable.empty();

    if (!data.length) {
      $teachersTable.append(
        `<tr>
          <td colspan="5" class="text-center py-4">No teachers found.</td>
        </tr>`,
      );
      $("#prevTeacherPage, #nextTeacherPage").hide();
      return;
    }

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = data.slice(start, end);

    $.each(pageData, function (_, teacher) {
      $teachersTable.append(`
        <tr>
          <td class="py-3 pr-5 whitespace-nowrap sm:pr-6">
            <span class="text-theme-sm font-medium text-gray-700 dark:text-gray-400">
              ${teacher.first_name} ${teacher.last_name}
            </span>
          </td>

          <td class="px-5 py-3 whitespace-nowrap sm:px-6">
            <span class="text-theme-sm text-gray-700 dark:text-gray-400">
              ${teacher.username}
            </span>
          </td>


          <td class="px-5 py-3 whitespace-nowrap sm:px-6">
            <div class="flex justify-center">
              <button
                data-id="${teacher.id}"
                class="deleteTeacherBtn text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      `);
    });

    renderTeacherPagination(data);
  }
  
  // ===============================
  // Pagination (same as classrooms)
  // ===============================
  function renderTeacherPagination(data) {
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
      renderTeacherTable(filteredTeachers());
    });

    currentPage <= 1
      ? $("#prevTeacherPage").hide()
      : $("#prevTeacherPage").show();
    currentPage >= totalPages
      ? $("#nextTeacherPage").hide()
      : $("#nextTeacherPage").show();
  }

  // ===============================
  // Search Filter (same pattern)
  // ===============================
  function filteredTeachers() {
    const query = ($searchInput.val() || "").toLowerCase();

    return teachersData.filter((t) => {
      if (!t) return false;

      const fullName =
        `${t.first_name || ""} ${t.last_name || ""}`.toLowerCase();
      const username = (t.username || "").toLowerCase();

      return fullName.includes(query) || username.includes(query);
    });
  }

  // ===============================
  // Search Input
  // ===============================
  $searchInput.on("input", function () {
    currentPage = 1;
    renderTeacherTable(filteredTeachers());
  });

  // ===============================
  // Load Teachers from Firebase
  // ===============================
  database.ref("users").on("value", function (snapshot) {
    const users = snapshot.val();
    teachersData = [];

    if (users) {
      $.each(users, function (id, user) {
        if (user.role === "teacher") {
          teachersData.push({
            id,
            ...user,
          });
        }
      });
    }

    currentPage = 1;
    renderTeacherTable(filteredTeachers());
  });

  // ===============================
  // Pagination Buttons
  // ===============================
  $("#prevTeacherPage").on("click", function () {
    if (currentPage > 1) {
      currentPage--;
      renderTeacherTable(filteredTeachers());
    }
  });

  $("#nextTeacherPage").on("click", function () {
    const totalPages = Math.ceil(filteredTeachers().length / rowsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderTeacherTable(filteredTeachers());
    }
  });

  // ===============================
  // Delete Teacher
  // ===============================
  $("#teachersTable").on("click", ".deleteTeacherBtn", function () {
    const teacherId = $(this).data("id");

    database.ref("users/" + teacherId).remove((error) => {
      if (error) console.log("Delete failed", error);
      else console.log("Teacher deleted");
    });
  });

  // Add teacher function

  $("#addTeacherBtn").click(function () {
    const data = {
      first_name: $("#firstName").val(),
      last_name: $("#lastName").val(),
      username: $("#username").val(),
      password: $("#password").val(),
      role: "teacher",
    };
    firebase
      .database()
      .ref("users")
      .push()
      .set(data, (error) => {
        if (error) {
          console.log("Data could not be saved.", error);
        } else {
          $("#firstName").val(""),
            $("#lastName").val(""),
            $("#username").val(""),
            $("#password").val(""),
          $("#addTeacherModal").attr("style", "display:none;");
        }
      });
  });
});
