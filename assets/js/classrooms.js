$(document).ready(function () {
  let classroomsData = []; // store all classrooms
  let currentPage = 1;
  const rowsPerPage = 5;

  const $classroomsTable = $("#classroomsTable");
  const $searchInput = $("#searchInput");
  const $paginationList = $("#paginationList"); // your pagination container

  // Function to render table
  function renderTable(data) {
    $classroomsTable.empty();
    if (!data.length) {
      $classroomsTable.append(
        `<tr><td colspan="3" class="text-center py-4">No classrooms found.</td></tr>`,
      );
      $("#prevPage, #nextPage").hide(); // hide buttons if no data
      return;
    }

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = data.slice(start, end);

    $.each(pageData, function (id, classroom) {
      const date = classroom.created_at
        ? new Date(classroom.created_at).toLocaleString()
        : "";
      // console.log(classroom.id);
      var teachersName = "";

      database
        .ref("users")
        .once("value")
        .then(function (snapshot) {
          const users = snapshot.val();

          if (!users || !classroom.teachers) return;

          classroom.teachers.forEach(function (teacherId) {
            const user = users[teacherId];

            if (user && user.role === "teacher") {
              teachersName += user.first_name + " " + user.last_name + ", ";
            }
          });

          teachersName = teachersName.replace(/, $/, "");
          $classroomsTable.append(`
      <tr>
        <td class="py-3 pr-5 whitespace-nowrap sm:pr-6">
          <div>
            <span class="text-theme-sm block font-medium text-gray-700 dark:text-gray-400">
              ${classroom.classroom_name}
            </span>
          </div>
        </td>
        <td class="py-3 pr-5 whitespace-nowrap sm:pr-6">
          <div>
            <span class="text-theme-sm block font-medium text-gray-700 dark:text-gray-400">
              ${teachersName}
            </span>
          </div>
        </td>
        <td class="py-3 pr-5 whitespace-nowrap sm:pr-6">
          <div>
            <span class="text-theme-sm block font-medium text-gray-700 dark:text-gray-400">
              ${date} 
            </span>
          </div>
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
                                data-id="${classroom.id}"
                                id="removeClassroomBtn"
                                  class="text-theme-xs flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
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
    });

    renderPagination(data);
  }

  function renderPagination(data) {
    $paginationList.empty();
    const totalPages = Math.ceil(data.length / rowsPerPage);

    for (let i = 1; i <= totalPages; i++) {
      const activeClass =
        i === currentPage
          ? "bg-brand-500/[0.08] text-brand-500"
          : "text-gray-700 dark:text-gray-400";
      $paginationList.append(
        `<li>
                        <a
                          href="#"
                          class="${activeClass} text-theme-sm hover:bg-brand-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500 flex h-10 w-10 items-center justify-center rounded-lg font-medium text-gray-700 dark:text-gray-400"
                        >
                          ${i}
                        </a>
                      </li>`,
      );
    }

    $paginationList.find("a").on("click", function (e) {
      e.preventDefault();
      currentPage = parseInt($(this).text());
      renderTable(filteredClassrooms());
    });

    if (currentPage <= 1) {
      $("#prevPage").hide();
    } else {
      $("#prevPage").show();
    }

    if (currentPage >= totalPages) {
      $("#nextPage").hide();
    } else {
      $("#nextPage").show();
    }
  }

  function filteredClassrooms() {
    const query = ($searchInput.val() || "").toLowerCase(); // ensure input is string
    return classroomsData.filter((s) => {
      if (!s) return false; // skip undefined/null entries
      const name = s.classroom_name || ""; // ensure classroom_name is string
      return name.toLowerCase().includes(query);
    });
  }

  $searchInput.on("input", function () {
    currentPage = 1;
    renderTable(filteredClassrooms());
  });

  database.ref("classrooms").on("value", function (snapshot) {
    const classrooms = snapshot.val();
    console.log(classrooms);
    classroomsData = [];
    if (classrooms) {
      $.each(classrooms, function (id, classroom) {
        classroomsData.push({
          id: id, // Firebase unique key
          ...classroom, // classroom data
        });
      });
    }
    currentPage = 1;
    renderTable(filteredClassrooms());
  });

  $("#addClassroomBtn").on("click", function () {
    const data = {
      classroom_name: $("#classroomName").val(),
      teachers: $("#teachers").val(),
      created_at: firebase.database.ServerValue.TIMESTAMP,
    };
    firebase
      .database()
      .ref("classrooms")
      .push()
      .set(data, (error) => {
        if (error) {
          console.log("Data could not be saved.", error);
        } else {
          console.log("Data saved successfully!");
          $("#classroomName").val("");
          $("#addClassroomModal").attr("style", "display:none;");
        }
      });
  });

  $("#prevPage").on("click", () => {
    currentPage--;
    renderTable(filteredClassrooms());
  });

  $("#nextPage").on("click", () => {
    currentPage++;
    renderTable(filteredClassrooms());
  });

  $("#classroomsTable").on("click", "#removeClassroomBtn", function () {
    const classroomId = $(this).data("id");
    // console.log(classroomId);
    removeClassroom(classroomId);
  });
  function removeClassroom(classroomId) {
    database.ref("classrooms/" + classroomId).remove((error) => {
      if (error) {
        console.log("Data could not be deleted.", error);
      } else {
        console.log("Data deleted successfully!");
      }
    });
  }

  database.ref("users").on("value", function (snapshot) {
    const users = snapshot.val();
    teachersData = [];

    if (users) {
      $.each(users, function (id, user) {
        if (user.role === "teacher") {
          $("#teachers").append(`
            <option value="${id}">
              ${user.first_name} ${user.last_name}
            </option>
          `);
        }
      });
    }
    new TomSelect("#teachers", {
      plugins: ["remove_button"],
      maxItems: null, // unlimited selections
      create: false,
      persist: false,
      placeholder: "Select teachers...",
    });
  });
});
