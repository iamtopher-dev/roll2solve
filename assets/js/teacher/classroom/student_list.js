let performanceChart = null;

$(document).ready(function () {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  database.ref(`classrooms/${id}`).on("value", function (snapshot) {
    const classroom = snapshot.val();

    database.ref(`users`).on("value", function (snapshot) {
      const students = snapshot.val();
      $("#studentsListTable").empty();

      if (!students) return;

      $.each(students, function (userId, student) {
        console.log(student);
        if (
          student.role === "student" &&
          student.classroom === classroom.classroom_name
        ) {
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
                  id="viewStatisticsBtn"
                  data-userid="${userId}"
                  class="rounded-lg bg-white px-4 py-2 text-sm shadow ring-1 ring-gray-300 hover:bg-gray-50">
                  View Statistics
                </button>
              </td>
            </tr>
          `);
        }
      });
    });
  });

  $("#studentsListTable").on("click", "#viewStatisticsBtn", function () {
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

  function loadStudentStats(userId) {
    database.ref("player_data").once("value", function (snapshot) {
      const data = snapshot.val();
      if (!data) return;

      const records = Object.values(data).filter((r) => r.user_id === userId);

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

  function renderAllQuizGraph(userId) {
    const ctx = document.getElementById("myChart").getContext("2d");

    database.ref("player_data").once("value", function (snapshot) {
      const data = snapshot.val();
      if (!data) return;

      const records = Object.values(data).filter((r) => r.user_id === userId);

      if (records.length === 0) return;

      const quizMap = {};

      records.forEach((r) => {
        if (!quizMap[r.quiz_id]) {
          quizMap[r.quiz_id] = { correct: 0, total: 0 };
        }

        quizMap[r.quiz_id].correct +=
          (r.correctQAddition || 0) +
          (r.correctQSubtraction || 0) +
          (r.correctQMultiplication || 0) +
          (r.correctQDivision || 0);

        quizMap[r.quiz_id].total +=
          (r.totalQAddition || 0) +
          (r.totalQSubtraction || 0) +
          (r.totalQMultiplication || 0) +
          (r.totalQDivision || 0);
      });

      const labels = [];
      const values = [];

      Object.keys(quizMap).forEach((quizId, index) => {
        const q = quizMap[quizId];
        labels.push(`Quiz ${index + 1}`);
        values.push(q.correct);
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
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    });
  }

  function show_dunt_by_user(user_id) {
    $("#list_take_student_exam").empty();
    firebase
      .database()
      .ref("player_data_exam")
      .on("value", function (snapshot) {
        const player_data_exam = snapshot.val();
        let takeCount = {};

        $.each(player_data_exam, function (id, exam) {
          if (exam.user_id === user_id) {
            if (!takeCount[user_id]) takeCount[user_id] = 1;
            else takeCount[user_id] += 1;

            let takeText =
              takeCount[user_id] +
              (takeCount[user_id] === 1
                ? "st"
                : takeCount[user_id] === 2
                  ? "nd"
                  : takeCount[user_id] === 3
                    ? "rd"
                    : "th") +
              " Take";
            $("#list_take_student_exam").append(`<tr>
  <td class="border border-gray-300 py-2 px-3 text-center text-sm">
    ${takeText}
  </td>
  <td class="border border-gray-300 py-2 px-3 text-center">
    ${exam.correctQAddition || 0}
  </td>
  <td class="border border-gray-300 py-2 px-3 text-center">
    ${getPL(exam.correctQAddition)}
  </td>
  <td class="border border-gray-300 py-2 px-3 text-center">
    ${exam.correctQSubtraction || 0}
  </td>
  <td class="border border-gray-300 py-2 px-3 text-center">
    ${getPL(exam.correctQSubtraction)}
  </td>
  <td class="border border-gray-300 py-2 px-3 text-center">
    ${exam.correctQMultiplication || 0}
  </td>
  <td class="border border-gray-300 py-2 px-3 text-center">
    ${getPL(exam.correctQMultiplication)}
  </td>
  <td class="border border-gray-300 py-2 px-3 text-center">
    ${exam.correctQDivision || 0}
  </td>
  <td class="border border-gray-300 py-2 px-3 text-center">
    ${exam.correctQDivision >= 9 ? "H" : exam.correctQDivision >= 5 ? "M" : "L"}
  </td>
  <td class="border border-gray-300 py-2 px-3 text-center">
  ${
    exam.correctQAddition < 5 ||
    exam.correctQSubtraction < 5 ||
    exam.correctQMultiplication < 5
      ? "NN"
      : "N"
  }
</td>
  <td class="border border-gray-300 py-2 px-3 text-center">
  ${evaluateTake(exam).action}
  </td>
</tr>`);
          }
        });
      });
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
  function getPL(score) {
    if (score >= 9) return "H";
    if (score >= 5) return "M";
    return "L";
  }
});
