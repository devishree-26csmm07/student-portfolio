if (localStorage.getItem("loggedIn") !== "yes") {
    window.location.href = "login.html";
}

let editId = null;

const studentForm = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
const statusText = document.getElementById("status");

async function loadStudents() {
    try {
        const response = await fetch("/students");
        const students = await response.json();

        studentList.innerHTML = "";

        students.forEach(function (student) {
            const item = document.createElement("div");
            item.className = "student-card";

            if (student.photo) {
                const image = document.createElement("img");
                image.src = student.photo;
                image.alt = "Student profile picture";
                image.className = "student-photo";
                item.appendChild(image);
            }

            const details = document.createElement("p");
            details.textContent =
                "Name: " + (student.name || "") +
                " | Course: " + (student.course || "") +
                " | Skills: " + (student.skills || "") +
                " | Achievement: " + (student.achievement || "");
            item.appendChild(details);

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.onclick = function () {
                editStudent(student);
            };

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.onclick = function () {
                deleteStudent(student._id);
            };

            item.appendChild(editButton);
            item.appendChild(deleteButton);
            studentList.appendChild(item);
        });
    } catch (error) {
        statusText.textContent = "Unable to load student details";
    }
}

studentForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("course", document.getElementById("course").value);
    formData.append("skills", document.getElementById("skills").value);
    formData.append("achievement", document.getElementById("achievement").value);

    const photo = document.getElementById("photo").files[0];
    if (photo) {
        formData.append("photo", photo);
    }

    try {
        let url = "/addStudent";
        let method = "POST";

        if (editId) {
            url = "/updateStudent/" + editId;
            method = "PUT";
        }

        const response = await fetch(url, {
            method: method,
            body: formData
        });

        const result = await response.json();
        statusText.textContent = result.message;

        if (response.ok) {
            studentForm.reset();
            editId = null;
            document.getElementById("saveButton").textContent = "Add Student";
            loadStudents();
        }
    } catch (error) {
        statusText.textContent = "Unable to save student details";
    }
});

function editStudent(student) {
    document.getElementById("name").value = student.name || "";
    document.getElementById("course").value = student.course || "";
    document.getElementById("skills").value = student.skills || "";
    document.getElementById("achievement").value = student.achievement || "";
    document.getElementById("photo").value = "";
    editId = student._id;
    document.getElementById("saveButton").textContent = "Update Student";
    statusText.textContent = "Choose a new picture only if you want to replace the current one.";
    window.scrollTo(0, 0);
}

async function deleteStudent(id) {
    if (!confirm("Do you want to delete this student?")) {
        return;
    }

    try {
        const response = await fetch("/deleteStudent/" + id, {
            method: "DELETE"
        });
        const result = await response.json();
        statusText.textContent = result.message;
        if (response.ok) {
            loadStudents();
        }
    } catch (error) {
        statusText.textContent = "Unable to delete student";
    }
}

function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}

loadStudents();
