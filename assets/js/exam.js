$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);
  const params_id = params.get("id");
  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));
  generate();
  function generate() {
    for (let i = 1; i < 11; i++) {
      const data = {
        question: `${i} * 1`.trim(),
        answer: (i * 1).toString().trim(),
        operator_type: "multiplication".trim(),
        created_at: firebase.database.ServerValue.TIMESTAMP,
      };

      firebase
        .database()
        .ref("exam")
        .push(data)
        .then(() => {
          $("#question").val("");
          $("#answer").val("");
          $("#operator_type").val("");
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
    const operator_type = $("#operator_type").val().trim();
    if (!question) {
      alert("Question name is required");
      return;
    }

    if (!answer) {
      alert("Answer name is required");
      return;
    }

    if (!operator_type) {
      alert("Operator type is required");
      return;
    }

    const data = {
      question: question,
      answer: answer,
      operator_type: operator_type,
      created_at: firebase.database.ServerValue.TIMESTAMP,
    };

    firebase
      .database()
      .ref("exam")
      .push(data)
      .then(() => {
        $("#question").val("");
        $("#answer").val("");
        $("#operator_type").val("");
        $("#addQuestionModal").hide();
        console.log("Quiz added successfully");
      })
      .catch((error) => {
        console.error("Error saving quiz:", error);
      });
  });

  firebase
    .database()
    .ref("exam")
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
                                      ${date}
                                    </p>
                                  </div>
                                </td>
                              </tr>`);
      });
    });
  $("#testToggle").on("change", function () {
    if ($(this).is(":checked")) {
      update_exam_settings("Post-Test");
    } else {
      update_exam_settings("Pre-Test");
    }
  });

  fetch_exam_settings();

  function fetch_exam_settings() {
  firebase
    .database()
    .ref("settings_exam/-OlBFIcptj7O4yeo3jK2")
    .once("value")
    .then((snapshot) => {
      const settings = snapshot.val();

      if (settings && settings.type === "Post-Test") {
        document.getElementById("testToggle").checked = true;
        
      } else {
        document.getElementById("testToggle").checked = false;
      }

      // trigger change so Alpine updates UI
      document.getElementById("testToggle").dispatchEvent(new Event("change"));
    });
}

  function update_exam_settings(type) {
    const data = {
      type: type,
    };
    firebase
      .database()
      .ref("settings_exam/-OlBFIcptj7O4yeo3jK2")
      .update(data)
      .then(() => {
        console.log("Quiz added successfully");
      })
      .catch((error) => {
        console.error("Error saving quiz:", error);
      });
  }
});
