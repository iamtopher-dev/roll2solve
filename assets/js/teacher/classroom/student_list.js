$(document).ready(function () {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  database.ref(`classrooms/${id}`).on("value", function (snapshot) {
    const classroom = snapshot.val();
    console.log(classroom);

    database.ref(`users`).on("value", function (snapshot) {
      const students = snapshot.val();

      if (students) {
        $.each(students, function (id, student) {
          if (
            student.role === "student" &&
            student.classroom === classroom.classroom_name
          ) {
            $("#studentsListTable").append(`<tr>
                              <td class="py-3 pr-5 whitespace-nowrap sm:pr-5">
                                <div class="col-span-3 flex items-center">
                                  <div class="flex items-center gap-3">
                                  

                                    <div>
                                      <span
                                        class="text-theme-sm block font-medium text-gray-700 dark:text-gray-400"
                                      >
            ${student.first_name} ${student.last_name}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td class="px-5 py-3 whitespace-nowrap sm:px-6">
                                <div class="flex items-center">
                                  <p
                                    class="text-theme-sm text-gray-700 dark:text-gray-400"
                                  >
                                    ${student.student_id}
                                  </p>
                                </div>
                              </td>
                              <td class="px-5 py-3 whitespace-nowrap sm:px-6">
                                <div class="flex items-center">
                                  <p
                                    class="text-theme-sm text-gray-700 dark:text-gray-400"
                                  >
                                    ${student.birthday}
                                  </p>
                                </div>
                              </td>
                              <td class="px-5 py-3 whitespace-nowrap sm:px-6">
                                <div class="flex items-center">
                                  <p
                                    class="text-theme-sm text-gray-700 dark:text-gray-400"
                                  >
                                    ${student.gender}
                                  </p>
                                </div>
                              </td>
                            </tr>`);
          }
        });
      }
    });
  });

  // database.ref(`manage_classroom/${id}`).on("value", function (snapshot) {
  //   const manage_classroom = snapshot.val();
    

  //   // studentsData = [];

  //   // if (users) {
  //   //   $.each(users, function (id, user) {
  //   //     if (user.role === "student") {
  //   //       studentsData.push({
  //   //         id,
  //   //         ...user,
  //   //       });
  //   //     }
  //   //   });
  //   // }

  //   // currentPage = 1;
  //   // renderStudentTable(filteredStudents());
  // });
});
