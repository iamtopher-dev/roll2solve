$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);
  const manageClassroomId = params.get("id");
  database
    .ref(`classrooms/${manageClassroomId}`)
    .once("value", function (snapshot) {
      const classroom = snapshot.val();
      $("#sectionDisplay").text(`Students in ${classroom.classroom_name}`);
    });
  if (!manageClassroomId) {
    $("#leaderboardBody").html(`
      <tr>
        <td colspan="3" style="text-align:center;">No Classroom Selected</td>
      </tr>
    `);
    return;
  }

  // 1️⃣ Get all quiz
  firebase
    .database()
    .ref("quiz")
    .once("value", function (quizSnap) {
      let classroomName = null;

      quizSnap.forEach(function (childSnapshot) {
        const quiz = childSnapshot.val();

        if (quiz.manage_classroom_id === manageClassroomId) {
          classroomName = quiz.classroom_name;
        }
      });

      if (!classroomName) {
        $("#leaderboardBody").html(`
        <tr>
          <td colspan="3" style="text-align:center;">Classroom Not Found</td>
        </tr>
      `);
        return;
      }

      // 2️⃣ Get users
      firebase
        .database()
        .ref("users")
        .once("value", function (userSnap) {
          const users = userSnap.val();
          const classroomUsers = {};

          Object.keys(users).forEach((userId) => {
            if (
              users[userId].classroom &&
              users[userId].classroom.trim().toLowerCase() ===
                classroomName.trim().toLowerCase()
            ) {
              classroomUsers[userId] = {
                name: users[userId].first_name + " " + users[userId].last_name,
                total_points: 0,
              };
            }
          });

          // 3️⃣ Get player_data
          firebase
            .database()
            .ref("player_data")
            .once("value", function (playerSnap) {
              playerSnap.forEach(function (childSnapshot) {
                const data = childSnapshot.val();
                const userId = data.user_id;
                const points = parseInt(data.points) || 0;

                if (classroomUsers[userId]) {
                  classroomUsers[userId].total_points += points;
                }
              });

              // 4️⃣ Convert to array
              const leaderboardArray = Object.keys(classroomUsers).map(
                (userId) => ({
                  name: classroomUsers[userId].name,
                  total_points: classroomUsers[userId].total_points,
                }),
              );

              // 5️⃣ Sort descending
              leaderboardArray.sort((a, b) => b.total_points - a.total_points);

              // 6️⃣ Render table
              if (leaderboardArray.length === 0) {
                $("#leaderboardBody").html(`
            <tr>
              <td colspan="3" style="text-align:center;">No Data Available</td>
            </tr>
          `);
                return;
              }

              let html = "";

              leaderboardArray.forEach((player, index) => {
                let medal = "";
                if (index === 0) medal = "🥇";
                else if (index === 1) medal = "🥈";
                else if (index === 2) medal = "🥉";

                html += `
            <tr>
              <td class="py-3 pr-5 whitespace-nowrap">
                ${medal} ${index + 1}
              </td>

              <td class="px-5 py-3 whitespace-nowrap">
                ${player.name}
              </td>

              <td class="px-5 py-3 whitespace-nowrap">
                ${player.total_points}
              </td>
            </tr>
          `;
              });

              $("#leaderboardBody").html(html);
            });
        });
    });
});
