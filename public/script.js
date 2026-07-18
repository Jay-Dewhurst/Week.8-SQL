// CONFIG

// Relative path
const API_BASE = "/api";

// AUTHENTICATED FETCH REQUESTS
// Wraps fetch so every request includes an available login token
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json", // Data type sent
        ...options.headers, // Extra headers the caller passed
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`; // Attach if one exists
    }

    const response = await fetch(API_BASE + endpoint, {
        ...options, headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || data.error || "Something went wrong.");
    }

    return data;
}

// REGISTER
const registerForm = document.getElementById("register-form");
const registerMessage = document.getElementById("register-message");

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const passwordRepeat = document.getElementById("register-password-repeat").value;

    if (password.length < 8) {
        registerMessage.textContent = "Password must be at least 8 characters.";
        return;
    }

    if (password !== passwordRepeat) {
        registerMessage.textContent = "Passwords do not match.";
        return;
    }

    try {
        const data = await apiRequest("/users", {
            method: "POST",
            body: JSON.stringify({
                username: email,
                email: email,
                password: password,
            }),
        });

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.userData));

        registerMessage.textContent = "";
        showLoggedInView(data.userData);
    } catch (error) {
        registerMessage.textContent = error.message;
    }
});

// SHOWING LOGGED IN STATE
function showLoggedInView(user) {
    document.getElementById("register-view").classList.add("hidden");
    document.getElementById("logged-in-view").classList.remove("hidden");
    document.getElementById("welcome-username").textContent = user.username;

    document.getElementById("login-panel").classList.add("hidden");
    document.querySelector(".hr-sidebar")?.classList.add("hidden");
    document.getElementById("posts-container").classList.remove("hidden");
    document.getElementById("my-posts-container").classList.remove("hidden");
}

// CHECKING LOGIN STATUS
const savedUser = localStorage.getItem("user");

if (savedUser) {
    showLoggedInView(JSON.parse(savedUser));
}

// LOGOUT
const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    document.getElementById("logged-in-view").classList.add("hidden");
    document.getElementById("register-view").classList.remove("hidden");
    document.getElementById("login-panel").classList.remove("hidden");
    document.getElementById("posts-container").classList.add("hidden");
    document.getElementById("my-posts-container").classList.add("hidden");
    document.querySelector(".hr-sidebar")?.classList.remove("hidden");
    document.getElementById("welcome-username").textContent = "";
});

// LOGIN
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
        const data = await apiRequest("/users/login", {
            method: "POST",
            body: JSON.stringify({
                email: username,
                password: password,
            }),
        });

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.userData));

        loginMessage.textContent = "";
        showLoggedInView(data.userData);
    } catch (error) {
        loginMessage.textContent = error.message;
    }
});

// CATEGORIES
async function loadCategories() {
    try {
        const data = await apiRequest("/categories");
        const categorySelect = document.getElementById("post-category");

        data.forEach(function (category) {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.category_name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to load categories:", error);
    }
}

loadCategories();

// CREATE POST
const createPostForm = document.getElementById("create-post-form");

createPostForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("post-title").value;
    const categoryId = document.getElementById("post-category").value;
    const content = document.getElementById("post-content").value;

    if (!categoryId) {
        alert("Please select a category.");
        return;
    }

    try {
        if (editingPostId) {
            await apiRequest("/posts/" + editingPostId, {
                method: "PUT",
                body: JSON.stringify({
                    title: title,
                    content: content,
                    postedBy: JSON.parse(localStorage.getItem("user")).username,
                    categoryId: categoryId,
                }),
            });

            editingPostId = null;
            document.getElementById("submit-postbtn").textContent = "Publish Post";
        } else {
            await apiRequest("/posts", {
                method: "POST",
                body: JSON.stringify({
                    title: title,
                    content: content,
                    postedBy: JSON.parse(localStorage.getItem("user")).username,
                    categoryId: categoryId,
                }),
            });
        }

        createPostForm.reset();
        loadMyPosts();
    } catch (error) {
        alert("Could not save post: " + error.message);
    }
});

// MY POSTS
async function loadMyPosts() {
    const myPostsList = document.getElementById("my-posts-lists");
    myPostsList.innerHTML = "";

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        return;
    }

    try {
        const allPosts = await apiRequest("/posts");
        const myPosts = allPosts.filter(function (post) {
            return post.userId === currentUser.id;
        });

        myPosts.forEach(function (post) {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${post.title}</strong>
                <p>${post.content}</p>
                <button class="edit-post-btn" data-id="${post.id}">Edit</button>
                <button class="delete-post-btn" data-id="${post.id}">Delete</button>
            `;
            myPostsList.appendChild(li);
        });
    } catch (error) {
        console.error("Failed to load posts:", error);
    }
}

loadMyPosts();

// DELETE POST
const myPostList = document.getElementById("my-posts-lists");

myPostList.addEventListener("click", async function (event) {
    if (!event.target.classList.contains("delete-post-btn")) {
        return;
    }
    
    const postId = event.target.dataset.id;
    const confirmed = confirm("Are you sure you want to delete this post?");

    if (!confirmed) {
        return;
    }

    try {
        await apiRequest("/posts/" + postId, {
            method: "DELETE",
        });
        loadMyPosts();
    } catch (error) {
        alert("Could not delete post: " + error.message);
    }
});

// EDIT POST
let editingPostId = null;

myPostList.addEventListener("click", function (event) {
    if (!event.target.classList.contains("edit-post-btn")) {
        return;
    }

    const postId = event.target.dataset.id;

    apiRequest("/posts/" + postId).then(function (post) {
        document.getElementById("post-title").value = post.title;
        document.getElementById("post-category").value = post.categoryId;
        document.getElementById("post-content").value = post.content;

        editingPostId = postId;
        document.getElementById("submit-postbtn").textContent = "Update Post";
    });
});

// BROWSE POSTS BY CATEGORY

async function loadBrowseCategories() {
    try {
        const data = await apiRequest("/categories");
        const browseCategorySelect = document.getElementById("browse-category-select");

        data.forEach(function (category) {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.category_name;
            browseCategorySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to load categories:", error);
    }
}

loadBrowseCategories();

async function loadBrowsePosts(categoryId) {
    const browsePostsList = document.getElementById("browse-posts-list");
    browsePostsList.innerHTML = "";

    try {
        let posts;

        if (categoryId) {
            posts = await apiRequest("/posts/category/" + categoryId);
        } else {
            posts = await apiRequest("/posts");
        }

        posts.forEach(function (post) {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${post.title}</strong>
                <p>${post.content}</p>
                <em>by ${post.postedBy}</em>
            `;
            browsePostsList.appendChild(li);
        });
    } catch (error) {
        console.error("Failed to load posts:", error);
    }
}

loadBrowsePosts();

const browseCategorySelect = document.getElementById("browse-category-select");

browseCategorySelect.addEventListener("change", function () {
    loadBrowsePosts(browseCategorySelect.value);
});

// LIVE CLOCK
function updateClock() {
    const clockElement = document.getElementById("live-clock");
    const now = new Date();
    clockElement.textContent = now.toLocaleTimeString();
}

setInterval(updateClock, 1000);
updateClock();