$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const latestPerUser = {};

  // 1️⃣ Load all exams ONCE
  database.ref("player_data_exam").once("value", function (snapshot) {
    const records = snapshot.val();
    if (!records) return;

    Object.values(records).forEach((record) => {
      const uid = record.user_id;

      if (
        !latestPerUser[uid] ||
        record.created_at > latestPerUser[uid].created_at
      ) {
        latestPerUser[uid] = record;
      }
    });

    // 2️⃣ Load classroom
    database.ref(`classrooms/${id}`).once("value", function (snapshot) {
      const classroom = snapshot.val();

      // 3️⃣ Load users
      database.ref("users").once("value", function (snapshot) {
        const students = snapshot.val();
        $("#studentsListTable").empty();

        if (!students) return;

        $.each(students, function (userId, student) {
            var count = 1;
          if (
            student.role === "student" &&
            student.classroom === classroom.classroom_name
          ) {
            const exam = latestPerUser[userId];

            if (exam) {
              console.log("Latest exam for", userId, exam);
              $("#latest_take_exam_student_list").append(`<tr>
                <td class="border border-gray-300 py-2 px-3 text-center text-sm">
    ${count++}
  </td>
  <td class="border border-gray-300 py-2 px-3 text-center text-sm">
    ${student.first_name} ${student.last_name}
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
          }
        });
      });
    });
  });

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
