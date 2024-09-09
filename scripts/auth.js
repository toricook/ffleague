// auth.js
console.log("auth.js is loading");

function checkAuth() {
    console.log("checkAuth function is running");
    if(localStorage.getItem("authenticated") !== "true") {
        console.log("User is not authenticated, redirecting to login page");
        window.location.href = "../login.html";
    } else {
        console.log("User is authenticated");
        if (document.getElementById('auth-status')) {
            document.getElementById('auth-status').textContent = "User is authenticated";
        }
    }
}

function logout() {
    console.log("logout function is running");
    localStorage.removeItem('authenticated');
    window.location.href = 'login.html';
}

// Make logout function globally accessible
window.logout = logout;

// Wait for DOM to be fully loaded before running checkAuth
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM is fully loaded");
    checkAuth();
});

console.log("auth.js has finished loading");