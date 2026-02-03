$(document).ready(function () {
  let SchoolsData = []; // store all Schools
  let currentPage = 1;
  const rowsPerPage = 5;

  const $schoolsTable = $("#schoolsTable");
  const $searchInput = $("#searchInput");
  const $paginationList = $("#paginationList"); // your pagination container

  // Function to render table
  function renderTable(data) {
    $schoolsTable.empty();
    if (!data.length) {
      $schoolsTable.append(
        `<tr><td colspan="3" class="text-center py-4">No Schools found.</td></tr>`,
      );
      $("#prevPage, #nextPage").hide(); // hide buttons if no data
      return;
    }

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = data.slice(start, end);

    $.each(pageData, function (id, School) {
      const date = School.created_at
        ? new Date(School.created_at).toLocaleString()
        : "";
      console.log(School.id);
      $schoolsTable.append(`
      <tr>
        <td class="py-3 pr-5 whitespace-nowrap sm:pr-6">
          <div>
            <span class="text-theme-sm block font-medium text-gray-700 dark:text-gray-400">
              ${School.school_name}
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
                                data-id="${School.id}"
                                id="removeSchoolBtn"
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
      renderTable(filteredSchools());
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

  function filteredSchools() {
    const query = ($searchInput.val() || "").toLowerCase(); // ensure input is string
    return SchoolsData.filter((s) => {
      if (!s) return false; // skip undefined/null entries
      const name = s.School_name || ""; // ensure School_name is string
      return name.toLowerCase().includes(query);
    });
  }

  $searchInput.on("input", function () {
    currentPage = 1;
    renderTable(filteredSchools());
  });

  database.ref("schools").on("value", function (snapshot) {
    const schools = snapshot.val();
    console.log(schools);
    SchoolsData = [];
    if (schools) {
      $.each(schools, function (id, school) {
        SchoolsData.push({
          id: id, // Firebase unique key
          ...school, // School data
        });
      });
    }
    currentPage = 1;
    renderTable(filteredSchools());
  });

  $("#addSchoolBtn").on("click", function () {
    const data = {
      school_name: $("#schoolName").val(),
      created_at: firebase.database.ServerValue.TIMESTAMP,
    };
    firebase
      .database()
      .ref("schools")
      .push()
      .set(data, (error) => {
        if (error) {
          console.log("Data could not be saved.", error);
        } else {
          console.log("Data saved successfully!");
          $("#schoolName").val("");
          $("#addSchoolModal").attr("style", "display:none;"); 
        }
      });
  });

  $("#prevPage").on("click", () => {
    currentPage--;
    renderTable(filteredSchools());
  });

  $("#nextPage").on("click", () => {
    currentPage++;
    renderTable(filteredSchools());
  });


  $('#schoolsTable').on('click', '#removeSchoolBtn', function() {
    const SchoolId = $(this).data('id');
    // console.log(SchoolId);
    removeSchool(SchoolId);
  });
  function removeSchool(SchoolId) {
    database.ref("Schools/" + SchoolId).remove((error) => {
      if (error) {
        console.log("Data could not be deleted.", error);
      } else {
        console.log("Data deleted successfully!");
      }
    });
  }
});
