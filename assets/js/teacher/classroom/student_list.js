let performanceChart = null;

$(document).ready(function () {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  let allStudents = {};
  let classroomName = "";

  // ==============================
  // LOAD CLASSROOM
  // ==============================
  database.ref(`classrooms/${id}`).on("value", function (snapshot) {
    const classroom = snapshot.val();
    if (!classroom) return;

    classroomName = classroom.classroom_name;
    $("#sectionDisplay").text(`Students in ${classroomName}`);
  });

  // ==============================
  // LOAD USERS
  // ==============================
  database.ref(`users`).on("value", function (snapshot) {
    allStudents = snapshot.val() || {};
    renderStudents();
  });

  // ==============================
  // FILTER CHANGE LISTENER
  // ==============================
  $("#filterAction, #filterGender").on("change", function () {
    renderStudents();
  });

  // ==============================
  // RENDER STUDENTS FUNCTION
  // ==============================
  function renderStudents() {
    const selectedAction = $("#filterAction").val();
    const selectedGender = $("#filterGender").val();

    $("#studentsListTable").empty();

    $.each(allStudents, function (userId, student) {
      if (
        student.role === "student" &&
        student.classroom === classroomName
      ) {
        // Filter Action
        if (selectedAction && student.current_action !== selectedAction) {
          return;
        }

        // Filter Gender
        if (selectedGender && student.gender !== selectedGender) {
          return;
        }

        const actionColor =
          {
            Enhancement: "bg-success-500",
            Consolidation: "bg-warning-500",
            Intervention: "bg-error-500",
          }[student.current_action] || "bg-gray-500";

        $("#studentsListTable").append(`
          <tr>
            <td class="py-3 pr-5 whitespace-nowrap">
              <span class="font-medium text-gray-700">
                ${student.first_name} ${student.last_name}
              </span>
            </td>

            <td class="px-5 py-3 whitespace-nowrap">
              <span class="rounded-full ${actionColor} px-3 py-1 text-white text-sm">
                ${student.current_action}
              </span>
            </td>

            <td class="px-5 py-3 whitespace-nowrap">
              <button 
                class="viewStatisticsBtn rounded-lg bg-white px-4 py-2 text-sm shadow ring-1 ring-gray-300 hover:bg-gray-50"
                data-userid="${userId}">
                View Statistics
              </button>
            </td>
          </tr>
        `);
      }
    });
  }

  // ==============================
  // VIEW STATISTICS BUTTON
  // ==============================
  $("#studentsListTable").on("click", ".viewStatisticsBtn", function () {
    const userId = $(this).data("userid");

    $("#viewStatisticsModal").fadeIn(200, function () {
      renderAllQuizGraph(userId);
      loadStudentStats(userId);
      show_dunt_by_user(userId);
    });
  });

  $("#closeViewStatisticsModal").on("click", function () {
    $("#viewStatisticsModal").fadeOut(150);
  });

  // ==============================
  // LOAD STUDENT SUMMARY
  // ==============================
  function loadStudentStats(userId) {
    database.ref("player_data").once("value", function (snapshot) {
      const data = snapshot.val();
      if (!data) return;

      const records = Object.values(data).filter(
        (r) => r.user_id === userId
      );

      if (records.length === 0) return;

      const totals = {
        correctA: 0,
        correctS: 0,
        correctM: 0,
        correctD: 0,
        totalA: 0,
        totalS: 0,
        totalM: 0,
        totalD: 0,
        points: 0,
      };

      records.forEach((r) => {
        totals.correctA += r.correctQAddition || 0;
        totals.correctS += r.correctQSubtraction || 0;
        totals.correctM += r.correctQMultiplication || 0;
        totals.correctD += r.correctQDivision || 0;

        totals.totalA += r.totalQAddition || 0;
        totals.totalS += r.totalQSubtraction || 0;
        totals.totalM += r.totalQMultiplication || 0;
        totals.totalD += r.totalQDivision || 0;

        totals.points += r.points || 0;
      });

      const totalQuestions =
        totals.totalA + totals.totalS + totals.totalM + totals.totalD;

      const totalCorrect =
        totals.correctA + totals.correctS + totals.correctM + totals.correctD;

      const overallAccuracy =
        totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

      const accuracy = {
        Addition:
          totals.totalA > 0 ? (totals.correctA / totals.totalA) * 100 : 0,
        Subtraction:
          totals.totalS > 0 ? (totals.correctS / totals.totalS) * 100 : 0,
        Multiplication:
          totals.totalM > 0 ? (totals.correctM / totals.totalM) * 100 : 0,
        Division:
          totals.totalD > 0 ? (totals.correctD / totals.totalD) * 100 : 0,
      };

      const mastery = Object.entries(accuracy).sort((a, b) => b[1] - a[1]);

      $("#totalMatches").text(records.length);
      $("#totalPoints").text(totals.points);
      $("#avgAccuracy").text(overallAccuracy.toFixed(1) + "%");
      $("#masterOperation").text(mastery[0][0]);

      $("#firstOp").text("1st · " + mastery[0][0]);
      $("#firstAcc").text(mastery[0][1].toFixed(1) + "%");

      $("#secondOp").text("2nd · " + mastery[1][0]);
      $("#secondAcc").text(mastery[1][1].toFixed(1) + "%");
    });
  }

  // ==============================
  // QUIZ PERFORMANCE GRAPH
  // ==============================
  function renderAllQuizGraph(userId) {
    const ctx = document.getElementById("myChart").getContext("2d");

    database.ref("player_data").once("value", function (snapshot) {
      const data = snapshot.val();
      if (!data) return;

      const records = Object.values(data).filter(
        (r) => r.user_id === userId
      );

      if (records.length === 0) return;

      const quizMap = {};

      records.forEach((r) => {
        if (!quizMap[r.quiz_id]) {
          quizMap[r.quiz_id] = { correct: 0 };
        }

        quizMap[r.quiz_id].correct +=
          (r.correctQAddition || 0) +
          (r.correctQSubtraction || 0) +
          (r.correctQMultiplication || 0) +
          (r.correctQDivision || 0);
      });

      const labels = [];
      const values = [];

      Object.keys(quizMap).forEach((quizId, index) => {
        labels.push(`Quiz ${index + 1}`);
        values.push(quizMap[quizId].correct);
      });

      if (performanceChart) performanceChart.destroy();

      performanceChart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Total Correct Answers per Quiz",
              data: values,
              borderColor: "#6366F1",
              backgroundColor: "rgba(99,102,241,0.2)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    });
  }

  // ==============================
  // EXAM TABLE
  // ==============================
  function show_dunt_by_user(user_id) {
    $("#list_take_student_exam").empty();

    firebase
      .database()
      .ref("player_data_exam")
      .once("value", function (snapshot) {
        const player_data_exam = snapshot.val();
        if (!player_data_exam) return;

        $.each(player_data_exam, function (id, exam) {
          if (exam.user_id === user_id) {
            $("#list_take_student_exam").append(`
              <tr>
                <td class="border py-2 px-3 text-center text-sm">
                  ${exam.typeExam}
                </td>
                <td class="border py-2 px-3 text-center">
                  ${exam.correctQAddition || 0}
                </td>
                <td class="border py-2 px-3 text-center">
                  ${getPL(exam.correctQAddition)}
                </td>
                <td class="border py-2 px-3 text-center">
                  ${exam.correctQSubtraction || 0}
                </td>
                <td class="border py-2 px-3 text-center">
                  ${getPL(exam.correctQSubtraction)}
                </td>
                <td class="border py-2 px-3 text-center">
                  ${exam.correctQMultiplication || 0}
                </td>
                <td class="border py-2 px-3 text-center">
                  ${getPL(exam.correctQMultiplication)}
                </td>
                <td class="border py-2 px-3 text-center">
                  ${exam.correctQDivision || 0}
                </td>
                <td class="border py-2 px-3 text-center">
                  ${getPL(exam.correctQDivision)}
                </td>
                <td class="border py-2 px-3 text-center">
                  ${evaluateTake(exam).action}
                </td>
              </tr>
            `);
          }
        });
      });
  }

  function getPL(score) {
    if (score >= 9) return "H";
    if (score >= 5) return "M";
    return "L";
  }

  function getAction(pls) {
    if (pls.includes("L")) return "I";
    if (pls.includes("M")) return "C";
    return "E";
  }

  function evaluateTake(scores) {
    const pls = [
      getPL(scores.correctQAddition),
      getPL(scores.correctQSubtraction),
      getPL(scores.correctQMultiplication),
      getPL(scores.correctQDivision),
    ];

    return {
      PLs: pls,
      action: getAction(pls),
    };
  }
});
