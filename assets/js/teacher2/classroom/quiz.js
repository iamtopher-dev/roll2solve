$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);
  const params_id = params.get("id");
  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));
  console.log(userLogged);
  database.ref(`classrooms/${params_id}`).once("value", function (snapshot) {
      const classroom = snapshot.val();
      $("#sectionDisplay").text(`Students in ${classroom.classroom_name}`);
  });

  $("#addQuizNameBtn").on("click", function () {
    const quizName = $("#quizName").val().trim();
    const timeInMinutes = $("#timeInMinutes").val();

    if (!quizName) {
      alert("Quiz name is required");
      return;
    }
    if (!timeInMinutes) {
      alert("Time in minutes is required");
      return;
    }

    console.log(params_id);
    firebase
      .database()
      .ref(`classrooms/${params_id}`)
      .once("value")
      .then(function (snapshot) {
        const classrooms = snapshot.val();
        
        if (!classrooms) return;
        console.log(classrooms);
        const data = {
          quiz_name: quizName,
          manage_classroom_id: params_id,
          classroom_name: classrooms.classroom_name,
          teacher_id: userLogged.id,
          time_in_minutes: timeInMinutes,
          created_at: firebase.database.ServerValue.TIMESTAMP,
        };

        firebase
          .database()
          .ref("quiz")
          .push(data)
          .then(() => {
            $("#quizName").val("");
            $("#addQuizNameModal").hide();
            console.log("Quiz added successfully");
          })
          .catch((error) => {
            console.error("Error saving quiz:", error);
          });
      });
  });

  firebase
    .database()
    .ref("quiz")
    .on("value", function (snapshot) {
      const quizNames = snapshot.val();

      // ✅ IMPORTANT: clear before append
      $("#listOfQuizName").empty();

      if (!quizNames) {
        $("#listOfQuizName").html(`
          <p class="text-gray-500 text-center">No quizzes found.</p>
        `);
        return;
      }

      $.each(quizNames, function (id, quiz) {
        if (
          quiz.manage_classroom_id === params_id &&
          quiz.teacher_id === userLogged.id
        ) {
          $("#listOfQuizName").append(`
            <div class="mb-4">
              <div class="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
                <h4 class="mb-2 text-xl font-medium text-gray-800">
                  ${quiz.quiz_name}
                </h4>

                <a
                  href="/teacher/questions.html?id=${id}"
                  class="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Manage Quiz
                </a>
              </div>
            </div>
          `);
        }
      });
    });
});
