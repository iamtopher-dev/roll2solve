$(document).ready(function () {
  const latestPerUser = {};

  // ==============================
  // SUMMARY OBJECTS
  // ==============================
  var summary = {
    Addition: { H: 0, M: 0, L: 0 },
    Subtraction: { H: 0, M: 0, L: 0 },
    Multiplication: { H: 0, M: 0, L: 0 },
    Division: { H: 0, M: 0, L: 0 },
  };

  var numeracySummary = {
    N: { Male: 0, Female: 0 },
    NN: { Male: 0, Female: 0 },
  };

  var actionSummary = {
    E: { Male: 0, Female: 0 },
    C: { Male: 0, Female: 0 },
    I: { Male: 0, Female: 0 },
  };

  // ==============================
  // LOAD EXAMS
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

    database.ref("users").once("value", function (snapshot) {
      const students = snapshot.val();
      $("#latest_take_exam_student_list").empty();
      if (!students) return;

      var count = 1;

      $.each(students, function (userId, student) {
        if (student.role === "student") {
          const exam = latestPerUser[userId];
          if (exam) {
            // Update summaries
            updateProficiencySummary(exam);
            updateNumeracyAndAction(student, exam);

            // Append table row (unchanged design)
            $("#latest_take_exam_student_list").append(`<tr>
              <td class="border border-gray-300 py-2 px-3 text-center text-sm">${count++}</td>
              <td class="border border-gray-300 py-2 px-3 text-center text-sm">${student.first_name} ${student.last_name}</td>

              <td class="border border-gray-300 py-2 px-3 text-center">${exam.correctQAddition || 0}</td>
              <td class="border border-gray-300 py-2 px-3 text-center">${getPL(exam.correctQAddition)}</td>

              <td class="border border-gray-300 py-2 px-3 text-center">${exam.correctQSubtraction || 0}</td>
              <td class="border border-gray-300 py-2 px-3 text-center">${getPL(exam.correctQSubtraction)}</td>

              <td class="border border-gray-300 py-2 px-3 text-center">${exam.correctQMultiplication || 0}</td>
              <td class="border border-gray-300 py-2 px-3 text-center">${getPL(exam.correctQMultiplication)}</td>

              <td class="border border-gray-300 py-2 px-3 text-center">${exam.correctQDivision || 0}</td>
              <td class="border border-gray-300 py-2 px-3 text-center">${getPL(exam.correctQDivision)}</td>

              <td class="border border-gray-300 py-2 px-3 text-center">${evaluateTake(exam).action === "E" ? "N" : "NN"}</td>
              <td class="border border-gray-300 py-2 px-3 text-center">${evaluateTake(exam).action}</td>
            </tr>`);
          }
        }
      });

      // Render summary in UI (if you have HTML summary elements)
      renderAllSummaries();
    });
  });

  // ==============================
  // SUMMARY LOGIC
  // ==============================
  function updateProficiencySummary(exam) {
    const operators = [
      { key: "correctQAddition", name: "Addition" },
      { key: "correctQSubtraction", name: "Subtraction" },
      { key: "correctQMultiplication", name: "Multiplication" },
      { key: "correctQDivision", name: "Division" },
    ];

    operators.forEach((op) => {
      const score = exam[op.key] || 0;
      const pl = getPL(score);
      summary[op.name][pl]++;
    });
  }

  function updateNumeracyAndAction(student, exam) {
    const gender = student.gender === "Male" ? "Male" : "Female";
    const result = evaluateTake(exam);
    const action = result.action;

    if (action === "E") numeracySummary.N[gender]++;
    else numeracySummary.NN[gender]++;

    actionSummary[action][gender]++;
  }

  function renderAllSummaries() {
    // UI summary (optional, depends on your HTML IDs)
    $("#h_addition").text(summary.Addition.H);
    $("#h_subtraction").text(summary.Subtraction.H);
    $("#h_multiplication").text(summary.Multiplication.H);
    $("#h_division").text(summary.Division.H);

    $("#m_addition").text(summary.Addition.M);
    $("#m_subtraction").text(summary.Subtraction.M);
    $("#m_multiplication").text(summary.Multiplication.M);
    $("#m_division").text(summary.Division.M);

    $("#l_addition").text(summary.Addition.L);
    $("#l_subtraction").text(summary.Subtraction.L);
    $("#l_multiplication").text(summary.Multiplication.L);
    $("#l_division").text(summary.Division.L);

    $("#n_male").text(numeracySummary.N.Male);
    $("#n_female").text(numeracySummary.N.Female);
    $("#n_total").text(numeracySummary.N.Male + numeracySummary.N.Female);

    $("#nn_male").text(numeracySummary.NN.Male);
    $("#nn_female").text(numeracySummary.NN.Female);
    $("#nn_total").text(numeracySummary.NN.Male + numeracySummary.NN.Female);

    $("#e_male").text(actionSummary.E.Male);
    $("#e_female").text(actionSummary.E.Female);
    $("#e_total").text(actionSummary.E.Male + actionSummary.E.Female);

    $("#c_male").text(actionSummary.C.Male);
    $("#c_female").text(actionSummary.C.Female);
    $("#c_total").text(actionSummary.C.Male + actionSummary.C.Female);

    $("#i_male").text(actionSummary.I.Male);
    $("#i_female").text(actionSummary.I.Female);
    $("#i_total").text(actionSummary.I.Male + actionSummary.I.Female);
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
    return { PLs: pls, action: getAction(pls) };
  }

  // ==============================
  // EXPORT TO EXCEL (UNCHANGED DESIGN)
  // ==============================
  $("#export_excel").click(function () {
    if ($("#latest_take_exam_student_list tr").length === 0) {
      alert("No data available to export.");
      return;
    }

    const wb = XLSX.utils.book_new();
    const ws = {};

    let rowIndex = 0;
    function addRow(rowData, style = {}) {
      rowData.forEach((cell, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
        ws[cellRef] = { v: cell, s: style };
      });
      rowIndex++;
    }

    const headerStyle = {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "D9D9D9" } },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    const centerStyle = {
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    // --- HEADER ROWS ---
    addRow(
      [
        "No.",
        "Student Name",
        "Addition",
        "",
        "Subtraction",
        "",
        "Multiplication",
        "",
        "Division",
        "",
        "Numeracy Level",
        "Recommended Action",
      ],
      headerStyle,
    );
    addRow(
      [
        "",
        "",
        "Score",
        "PL",
        "Score",
        "PL",
        "Score",
        "PL",
        "Score",
        "PL",
        "",
        "",
      ],
      headerStyle,
    );

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 0, c: 3 } },
      { s: { r: 0, c: 4 }, e: { r: 0, c: 5 } },
      { s: { r: 0, c: 6 }, e: { r: 0, c: 7 } },
      { s: { r: 0, c: 8 }, e: { r: 0, c: 9 } },
      { s: { r: 0, c: 10 }, e: { r: 1, c: 10 } },
      { s: { r: 0, c: 11 }, e: { r: 1, c: 11 } },
    ];

    // --- STUDENT DATA ---
    $("#latest_take_exam_student_list tr").each(function () {
      let cells = $(this).find("td");
      let numeracyText =
        $(cells[10]).text().trim() === "N" ? "Numerate" : "Non-Numerate";
      let actionMap = {
        E: "Enhancement",
        C: "Consolidation",
        I: "Intervention",
      };
      let actionText = actionMap[$(cells[11]).text().trim()] || "";
      addRow(
        [
          $(cells[0]).text().trim(),
          $(cells[1]).text().trim(),
          $(cells[2]).text().trim(),
          convertPL($(cells[3]).text().trim()),
          $(cells[4]).text().trim(),
          convertPL($(cells[5]).text().trim()),
          $(cells[6]).text().trim(),
          convertPL($(cells[7]).text().trim()),
          $(cells[8]).text().trim(),
          convertPL($(cells[9]).text().trim()),
          numeracyText,
          actionText,
        ],
        centerStyle,
      );
    });

    // --- SUMMARY ---
    rowIndex += 2;
    function addSummaryTitle(title) {
      addRow([title], headerStyle);
      ws["!merges"].push({
        s: { r: rowIndex - 1, c: 0 },
        e: { r: rowIndex - 1, c: 5 },
      });
    }

    addSummaryTitle("Summary Table for the Proficiency Level of the Class");
    addRow(
      ["", "Addition", "Subtraction", "Multiplication", "Division"],
      headerStyle,
    );
    addRow(
      [
        "No. of Highly Numerate Learners (High)",
        summary.Addition.H,
        summary.Subtraction.H,
        summary.Multiplication.H,
        summary.Division.H,
      ],
      centerStyle,
    );
    addRow(
      [
        "No. of Moderately Numerate Learners (Medium)",
        summary.Addition.M,
        summary.Subtraction.M,
        summary.Multiplication.M,
        summary.Division.M,
      ],
      centerStyle,
    );
    addRow(
      [
        "No. of Low Numerate Learners (Low)",
        summary.Addition.L,
        summary.Subtraction.L,
        summary.Multiplication.L,
        summary.Division.L,
      ],
      centerStyle,
    );
    rowIndex += 2;

    addSummaryTitle("Summary for Numeracy Level of the Class");
    addRow(["Numeracy Level", "Male", "Female", "Total"], headerStyle);
    addRow(
      [
        "Numerate",
        numeracySummary.N.Male,
        numeracySummary.N.Female,
        numeracySummary.N.Male + numeracySummary.N.Female,
      ],
      centerStyle,
    );
    addRow(
      [
        "Non-Numerate",
        numeracySummary.NN.Male,
        numeracySummary.NN.Female,
        numeracySummary.NN.Male + numeracySummary.NN.Female,
      ],
      centerStyle,
    );
    rowIndex += 2;

    addSummaryTitle("Summary for Recommended Action of the Class");
    addRow(["Recommended Action", "Male", "Female", "Total"], headerStyle);
    addRow(
      [
        "Enhancement",
        actionSummary.E.Male,
        actionSummary.E.Female,
        actionSummary.E.Male + actionSummary.E.Female,
      ],
      centerStyle,
    );
    addRow(
      [
        "Consolidation",
        actionSummary.C.Male,
        actionSummary.C.Female,
        actionSummary.C.Male + actionSummary.C.Female,
      ],
      centerStyle,
    );
    addRow(
      [
        "Intervention",
        actionSummary.I.Male,
        actionSummary.I.Female,
        actionSummary.I.Male + actionSummary.I.Female,
      ],
      centerStyle,
    );

    ws["!ref"] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: rowIndex, c: 11 },
    });
    ws["!cols"] = new Array(12).fill({ wch: 18 });

    XLSX.utils.book_append_sheet(wb, ws, "Class Report");
    XLSX.writeFile(wb, "Classroom_Exam_Report.xlsx");
  });

  function convertPL(pl) {
    if (pl === "H") return "High";
    if (pl === "M") return "Medium";
    return "Low";
  }
});
