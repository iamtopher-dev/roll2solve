$(document).ready(function () {
  let manageClassrooms = {};
  let usersData = {};
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  database.ref("classrooms").on("value", function (snapshot) {
    const classrooms = snapshot.val();
    console.log(classrooms);
    if (classrooms) {
      $.each(classrooms, function (id, classroom) {
        $("#classroom").append(`<option
                            value="${classroom.classroom_name}"
                            class="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                          >
                            ${classroom.classroom_name}
                          </option>`);
      });
    }
  });

  $("#addManageClassroomBtn").on("click", function () {
    const data = {
      teacher_id: user.id,
      classroom_name: $("#classroom").val(),
    };
    firebase
      .database()
      .ref("manage_classroom")
      .push()
      .set(data, (error) => {
        if (error) {
          console.log("Data could not be saved.", error);
        } else {
          $("#classroom").prop("selectedIndex", 0);

          $("#addManageClassroomModal").attr("style", "display:none;");
        }
      });
  });

  database.ref("manage_classroom").on("value", function (snapshot) {
    manageClassrooms = snapshot.val() || {};
    renderManageClassrooms();
  });

  database.ref("users").on("value", function (snapshot) {
    usersData = snapshot.val() || {};
    renderManageClassrooms();
  });

  function renderManageClassrooms() {
    $("#listOfManageClassroom").empty();

    $.each(manageClassrooms, function (classroomId, classroom) {
      let countStudent = 0;

      if (classroom.teacher_id == user.id) {
        $.each(usersData, function (userId, user) {
          if (
            user.role === "student" &&
            user.classroom === classroom.classroom_name
          ) {
            countStudent++;
          }
        });

        $("#listOfManageClassroom").append(`
      <div>
        <div
          class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6"
        >
          <div>
            <h4 class="mb-1 text-theme-xl font-medium text-gray-800 dark:text-white/90">
              ${classroom.classroom_name}
            </h4>

            <p class="text-sm text-gray-500 dark:text-gray-400">
              ${countStudent} students
            </p>

            <a
              href="/teacher/student_list.html?id=${classroomId}"
              class="manageClassroom mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
            >
              Manage
            </a>
          </div>
        </div>
      </div>
    `);
      }
    });
  }
});
