$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  $("#logoutBtn").on("click", function () {
    localStorage.removeItem("loggedInUser");
    window.location.href = "/";
  });

  $("#student_list_btn").on("click", function () {
    window.location.href = `/teacher/student_list.html?id=${id}`;
  });
  $("#view_dunt_btn").on("click", function () {
    window.location.href = `/teacher/view_dunt.html?id=${id}`;
  });
  $("#manage_quiz_btn").on("click", function () {
    window.location.href = `/teacher/quiz.html?id=${id}`;
  });
  $("#leaderboard_btn").on("click", function () {
    window.location.href = `/teacher/leaderboard.html?id=${id}`;
  });


  $("#student_list_btn2").on("click", function () {
    window.location.href = `/admin/student_list.html?id=${id}`;
  });
  $("#view_dunt_btn2").on("click", function () {
    window.location.href = `/admin/view_dunt.html?id=${id}`;
  });
  $("#leaderboard_btn2").on("click", function () {
    window.location.href = `/admin/leaderboard.html?id=${id}`;
  });
});
