$(document).ready(function () {

  const latestPerUser = {};
  var classroomActionSummary = {};

  var totalStudent = 0;
  var totalClassrooms = 0;

  // ==============================
  // TOTAL STUDENTS
  // ==============================
  database.ref("users").on("value", function (snapshot) {
    const students = snapshot.val();
    totalStudent = 0;

    $.each(students, function (id, student) {
      if (student.role === "student") {
        totalStudent++;
      }
    });

    $("#totalStudents").text(totalStudent);
  });

  // ==============================
  // TOTAL CLASSROOMS
  // ==============================
  database.ref("classrooms").on("value", function (snapshot) {
    const classrooms = snapshot.val();
    totalClassrooms = classrooms ? Object.keys(classrooms).length : 0;
    console.log("Total Sections:", totalClassrooms);
  });

  // ==============================
  // GET LATEST EXAM PER STUDENT
  // ==============================
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

    // ==============================
    // PROCESS STUDENTS
    // ==============================
    database.ref("users").once("value", function (snapshot) {
      const students = snapshot.val();
      if (!students) return;

      $.each(students, function (userId, student) {

        if (student.role === "student" && student.classroom) {

          const exam = latestPerUser[userId];

          if (exam) {

            const result = evaluateTake(exam);
            const action = result.action; // E / C / I
            const section = student.classroom;

            // Initialize classroom if not existing
            if (!classroomActionSummary[section]) {
              classroomActionSummary[section] = {
                E: 0,
                C: 0,
                I: 0
              };
            }

            classroomActionSummary[section][action]++;
          }
        }

      });

      renderAllSummaries();

    });

  });

  // ==============================
  // RENDER PIE CHARTS
  // ==============================
  function renderAllSummaries() {

    $("#chartsContainer").empty(); // clear previous charts

    Object.keys(classroomActionSummary).forEach((section) => {

      const data = classroomActionSummary[section];

      const safeId = section.replace(/\s+/g, '_');

      // Create chart container
      $("#chartsContainer").append(`
        <div style="width:300px; margin:20px; text-align:center;">
          <h4>${section}</h4>
          <canvas id="chart_${safeId}"></canvas>
        </div>
      `);

      const ctx = document
        .getElementById(`chart_${safeId}`)
        .getContext("2d");

      new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Enhancement", "Consolidation", "Intervention"],
          datasets: [{
            data: [data.E, data.C, data.I],
            backgroundColor: [
              "#28a745", // Green - Enhancement
              "#ffc107", // Yellow - Consolidation
              "#dc3545"  // Red - Intervention
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom"
            }
          }
        }
      });

    });

  }

  // ==============================
  // ACTION LOGIC
  // ==============================
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
