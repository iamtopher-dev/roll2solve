$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);
  const params_id = params.get("id");
  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));

  // ========================================
  // ADD QUESTION
  // ========================================
  $("#addQuestionBtn").on("click", function () {
    const question = $("#question").val().trim();
    const answer = $("#answer").val().trim();
    const operator_type = $("#operator_type").val().trim().toLowerCase();

    if (!question) return alert("Question is required");
    if (!answer) return alert("Answer is required");
    if (!operator_type) return alert("Operator type is required");

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
        console.log("Question added successfully");
      })
      .catch((error) => {
        console.error("Error saving question:", error);
      });
  });

  // ========================================
  // REALTIME LOAD & SEPARATE PER OPERATOR
  // ========================================
  firebase
    .database()
    .ref("exam")
    .on("value", function (snapshot) {
      const questions = snapshot.val();

      // Clear all tables first
      $("#additionTable").empty();
      $("#subtractionTable").empty();
      $("#multiplicationTable").empty();
      $("#divisionTable").empty();

      if (!questions) {
        $("#additionTable").html("<tr><td>No data</td></tr>");
        $("#subtractionTable").html("<tr><td>No data</td></tr>");
        $("#multiplicationTable").html("<tr><td>No data</td></tr>");
        $("#divisionTable").html("<tr><td>No data</td></tr>");
        return;
      }

      // Counters per operator
      const counters = {
        addition: 0,
        subtraction: 0,
        multiplication: 0,
        division: 0,
      };

      $.each(questions, function (id, question) {
        const operator = question.operator_type?.toLowerCase();
        if (!counters.hasOwnProperty(operator)) return;

        counters[operator]++;

        const date = question.created_at
          ? new Date(question.created_at).toLocaleString()
          : "";

        const rowHTML = `
          <tr>
            <td class="px-5 py-3 text-gray-700 whitespace-nowrap">
              ${counters[operator]}.
            </td>

            <td class="py-3 pr-5 text-gray-700 whitespace-nowrap">
              ${question.question}
            </td>

            <td class="px-5 py-3 text-gray-700 whitespace-nowrap">
              ${question.answer}
            </td>

            <td class="px-5 py-3 text-gray-700 whitespace-nowrap">
              ${date}
            </td>
          </tr>
        `;

        // Append to correct table
        if (operator === "addition") {
          $("#additionTable").append(rowHTML);
        } else if (operator === "subtraction") {
          $("#subtractionTable").append(rowHTML);
        } else if (operator === "multiplication") {
          $("#multiplicationTable").append(rowHTML);
        } else if (operator === "division") {
          $("#divisionTable").append(rowHTML);
        }
      });
    });

  // ========================================
  // TEST TOGGLE
  // ========================================
  $("#testToggle").on("change", function () {
    const type = $(this).is(":checked") ? "Post-Test" : "Pre-Test";
    update_exam_settings(type);
  });

  fetch_exam_settings();

  function fetch_exam_settings() {
    firebase
      .database()
      .ref("settings_exam/-OlBFIcptj7O4yeo3jK2")
      .once("value")
      .then((snapshot) => {
        const settings = snapshot.val();

        const isPost = settings && settings.type === "Post-Test";
        document.getElementById("testToggle").checked = isPost;

        document
          .getElementById("testToggle")
          .dispatchEvent(new Event("change"));
      });
  }

  function update_exam_settings(type) {
    firebase
      .database()
      .ref("settings_exam/-OlBFIcptj7O4yeo3jK2")
      .update({ type: type })
      .then(() => {
        console.log("Exam setting updated");
      })
      .catch((error) => {
        console.error("Error updating settings:", error);
      });
  }
});
