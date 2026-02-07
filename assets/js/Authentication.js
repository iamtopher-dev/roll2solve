$(document).ready(function () {
  $("#loginBtn").on("click", function () {
    const username = $("#username").val();
    const password = $("#password").val();

    $("#loginError").addClass("hidden");

    if (!username || !password) {
      showError("Please enter username and password");
      return;
    }

    firebase
      .database()
      .ref("users")
      .once("value")
      .then((snapshot) => {
        const users = snapshot.val();
        let foundUser = null;
        let userId = null;

        if (users) {
          $.each(users, function (id, user) {
            if (
              user.username === username &&
              user.password === password
            ) {
              foundUser = user;
              userId = id;
              return false; 
            }
          });
        }

        if (!foundUser) {
          showError("Invalid username or password");
          return;
        }

        localStorage.setItem(
          "loggedInUser",
          JSON.stringify({
            id: userId,
            username: foundUser.username,
            role: foundUser.role,
          })
        );

        if (foundUser.role === "admin") {
          window.location.href = "/admin/dashboard.html";
        } else if (foundUser.role === "teacher") {
          window.location.href = "/teacher/dashboard.html";
        }
      })
      .catch((error) => {
        console.error(error);
        showError("Login failed");
      });
  });

  function showError(msg) {
    $("#loginError").removeClass("hidden");
    $('#errorMessage').text(msg);
  }
});
