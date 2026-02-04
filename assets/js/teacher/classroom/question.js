$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);
  const params_id = params.get("id");
  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));

// generate();
  function generate(){
    for (let i = 1; i < 3; i++) {
      let answer = 20/i ;
    const data = {
          question: `20 / ${i}`,
          answer: answer,
          quiz_id: "-OkWkldix2sYGn5Et6tp",
          hint:answer,
          teacher_id: "-Ok89XhQ7njkcYIKlHs5",
          operator_type: "division",
          classroom_name: "Grade 7 - Maharlika",
          created_at: firebase.database.ServerValue.TIMESTAMP,
        };

        firebase
          .database()
          .ref("question")
          .push(data)
          .then(() => {
            $("#question").val("");
            $("#answer").val("");
            $("#addQuestionModal").hide();
            console.log("Quiz added successfully");
          })
          .catch((error) => {
            console.error("Error saving quiz:", error);
          });
        }
  }

  $("#addQuestionBtn").on("click", function () {
    const question = $("#question").val().trim();
    const answer = $("#answer").val().trim();
    const hint = $("#hint").val().trim();
    const operator_type = $("#operator_type").val().trim();

    if (!question) {
      alert("Question name is required");
      return;
    }

    if (!answer) {
      alert("Answer name is required");
      return;
    }
    if(!operator_type){
      alert("Operator type is required");
      return;
    }

    firebase
      .database()
      .ref(`quiz/${params_id}`)
      .once("value")
      .then(function (snapshot) {
        const quiz = snapshot.val();
        console.log(quiz);
        // if (!quiz) return;

        const data = {
          question: question,
          answer: answer,
          quiz_id: params_id,
          hint:hint,
          operator_type:operator_type,
          teacher_id: quiz.teacher_id,
          classroom_name: quiz.classroom_name,
          created_at: firebase.database.ServerValue.TIMESTAMP,
        };

        firebase
          .database()
          .ref("question")
          .push(data)
          .then(() => {
            $("#question").val("");
            $("#answer").val("");
            $("#addQuestionModal").hide();
            console.log("Quiz added successfully");
          })
          .catch((error) => {
            console.error("Error saving quiz:", error);
          });
      });
  });

  firebase
    .database()
    .ref("question")
    .on("value", function (snapshot) {
      const questions = snapshot.val();

      // ✅ IMPORTANT: clear before append
      $("#questionListsTable").empty();

      if (!questions) {
        $("#questionListsTable").html(`
            <p class="text-gray-500 text-center">No quizzes found.</p>
          `);
        return;
      }
      console.log(questions);

      $.each(questions, function (id, question) {
        const date = question.created_at
          ? new Date(question.created_at).toLocaleString()
          : "";
        if (
          question.quiz_id === params_id &&
          question.teacher_id === userLogged.id
        ) {
          $("#questionListsTable").append(`
                <tr>
                                <td class="py-3 pr-5 whitespace-nowrap sm:pr-5">
                                  <div class="col-span-3 flex items-center">
                                    <div class="flex items-center gap-3">

                                      <div>
                                        <span
                                          class="text-theme-sm block font-medium text-gray-700 dark:text-gray-400"
                                        >
              ${question.question}
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
                                      ${question.answer}
                                    </p>
                                  </div>
                                </td>
                                <td class="px-5 py-3 whitespace-nowrap sm:px-6">
                                  <div class="flex items-center">
                                    <p
                                      class="text-theme-sm text-gray-700 dark:text-gray-400"
                                    >
                                      ${(question.hint == "") ? "-" : question.hint}
                                    </p>
                                  </div>
                                </td>
                                <td class="px-5 py-3 whitespace-nowrap sm:px-6">
                                  <div class="flex items-center">
                                    <p
                                      class="text-theme-sm text-gray-700 dark:text-gray-400"
                                    >
                                      ${date}
                                    </p>
                                  </div>
                                </td>
                              </tr>`);
        }
      });
    });
});
