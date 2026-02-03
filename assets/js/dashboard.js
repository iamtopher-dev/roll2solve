$(document).ready(function () {
  var totalStudent = 0;
  var totalClassrooms = 0;
  database.ref("users").on("value", function (snapshot) {
    const students = snapshot.val();
    $.each(students, function (id, student) {
      if (student.role === "student") {
        totalStudent++;
      }
    });
    $("#totalStudents").text(totalStudent);
  });

  database.ref("classrooms").on("value", function (snapshot) {
    const classrooms = snapshot.val();
    totalClassrooms = classrooms ? Object.keys(classrooms).length : 0;
    console.log("Total Classrooms:", totalClassrooms);
    $("#totalClassrooms").text(totalClassrooms);
  });
});
