$(document).ready(function () {
  let allUsers = {};
  let allExams = {};
  let allSchools = {};

  // ==============================
  // LOAD ALL DATA ONCE
  // ==============================

  function loadInitialData() {
    Promise.all([
      database.ref("users").once("value"),
      database.ref("player_data_exam").once("value"),
      database.ref("schools").once("value"),
      database.ref("classrooms").once("value"),
    ]).then(([usersSnap, examsSnap, schoolsSnap, classroomsSnap]) => {
      allUsers = usersSnap.val() || {};
      allExams = examsSnap.val() || {};
      allSchools = schoolsSnap.val() || {};
      const classrooms = classroomsSnap.val() || {};

      renderSchoolDropdown();
      renderTotals();
    });
  }

  // ==============================
  // RENDER SCHOOL DROPDOWN
  // ==============================

  function renderSchoolDropdown() {
    $("#schoolSelect").empty();
    $("#schoolSelect").append(`<option value="">Select School</option>`);

    $.each(allSchools, function (id, school) {
      $("#schoolSelect").append(
        `<option value="${school.school_name}">${school.school_name}</option>`
      );
    });
  }

  // ==============================
  // TOTAL COUNTS
  // ==============================

  function renderTotals() {
    let totalStudents = 0;

    $.each(allUsers, function (id, user) {
      if (user.role === "student") totalStudents++;
    });

    $("#totalStudents").text(totalStudents);

    const totalClassrooms = Object.keys(allUsers).length;
    $("#totalClassrooms").text(totalClassrooms);
  }

  // ==============================
  // SCHOOL SELECTION EVENT
  // ==============================

  $("#schoolSelect").on("change", function () {
    const selectedSchool = $(this).val();

    if (!selectedSchool) {
      $("#chartsContainer").empty();
      return;
    }

    buildCharts(selectedSchool);
  });

  // ==============================
  // BUILD CHARTS PER SCHOOL
  // ==============================

  function buildCharts(selectedSchool) {
    const latestPerUser = {};
    const classroomActionSummary = {};

    // STEP 1: Get latest exam per user
    Object.values(allExams).forEach((record) => {
      const uid = record.user_id;

      if (
        !latestPerUser[uid] ||
        record.created_at > latestPerUser[uid].created_at
      ) {
        latestPerUser[uid] = record;
      }
    });

    // STEP 2: Process students
    $.each(allUsers, function (userId, student) {
      if (
        student.role === "student" &&
        student.school === selectedSchool &&
        student.classroom
      ) {
        const exam = latestPerUser[userId];
        if (!exam) return;

        const result = evaluateTake(exam);
        const action = result.action;
        const section = student.classroom;

        if (!classroomActionSummary[section]) {
          classroomActionSummary[section] = { E: 0, C: 0, I: 0 };
        }

        classroomActionSummary[section][action]++;
      }
    });

    renderCharts(classroomActionSummary);
  }

  // ==============================
  // RENDER PIE CHARTS
  // ==============================

  function renderCharts(summaryData) {
    $("#chartsContainer").empty();

    Object.keys(summaryData).forEach((section) => {
      const data = summaryData[section];
      const safeId = section.replace(/\s+/g, "_");

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
          datasets: [
            {
              data: [data.E, data.C, data.I],
              backgroundColor: [
                "#28a745",
                "#ffc107",
                "#dc3545",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    });
  }

  // ==============================
  // EVALUATION LOGIC
  // ==============================

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
      getPL(scores.correctQAddition || 0),
      getPL(scores.correctQSubtraction || 0),
      getPL(scores.correctQMultiplication || 0),
      getPL(scores.correctQDivision || 0),
    ];

    return {
      PLs: pls,
      action: getAction(pls),
    };
  }


  loadInitialData();
});
