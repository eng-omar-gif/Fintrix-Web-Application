/*let goals = [];
let goalCounter = 1;

const goalForm = document.getElementById("goalForm");
const goalsContainer = document.getElementById("goalsContainer");
const formMessage = document.getElementById("formMessage");

const contributionModal = document.getElementById("contributionModal");
const contributionForm = document.getElementById("contributionForm");
const selectedGoalId = document.getElementById("selectedGoalId");
const closeModalBtn = document.getElementById("closeModalBtn");

const darkModeBtn = document.getElementById("darkModeBtn");

goalForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const goalName = document.getElementById("goalName").value.trim();
    const targetAmount = parseFloat(document.getElementById("targetAmount").value);
    const currentAmount = parseFloat(document.getElementById("currentAmount").value);
    const deadline = document.getElementById("deadline").value;

    if (goalName === "" || targetAmount <= 0 || currentAmount < 0 || deadline === "") {
        formMessage.textContent = "Please enter valid goal data.";
        formMessage.style.color = "red";
        return;
    }

    if (currentAmount > targetAmount) {
        formMessage.textContent = "Saved amount cannot exceed target amount.";
        formMessage.style.color = "red";
        return;
    }

    const goal = {
        id: goalCounter++,
        name: goalName,
        targetAmount: targetAmount,
        currentAmount: currentAmount,
        deadline: deadline,
        status: "InProgress"
    };

    goals.push(goal);
    renderGoals();

    formMessage.textContent = "Goal created successfully.";
    formMessage.style.color = "green";

    goalForm.reset();
});

function renderGoals() {
    goalsContainer.innerHTML = "";

    if (goals.length === 0) {
        goalsContainer.innerHTML = "<p>No goals created yet.</p>";
        return;
    }

    goals.forEach(goal => {
        const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);

        if (progress >= 100) {
            goal.status = "Completed";
        }

        const goalCard = document.createElement("div");
        goalCard.classList.add("goal-card");

        goalCard.innerHTML = `
            <h3>${goal.name}</h3>
            <p class="goal-info"><strong>Target:</strong> ${goal.targetAmount} EGP</p>
            <p class="goal-info"><strong>Saved:</strong> ${goal.currentAmount} EGP</p>
            <p class="goal-info"><strong>Deadline:</strong> ${goal.deadline}</p>
            <p class="goal-info"><strong>Status:</strong> ${goal.status}</p>

            <div class="progress-bar">
                <div class="progress-fill" style="width:${progress}%"></div>
            </div>

            <p class="goal-info"><strong>Progress:</strong> ${progress}%</p>

            <div class="goal-actions">
                <button class="secondary-btn" onclick="openContributionModal(${goal.id})">Add Contribution</button>
                <button class="delete-btn" onclick="deleteGoal(${goal.id})">Delete</button>
            </div>
        `;

        goalsContainer.appendChild(goalCard);
    });
}

function deleteGoal(goalId) {
    goals = goals.filter(goal => goal.id !== goalId);
    renderGoals();
}

function openContributionModal(goalId) {
    selectedGoalId.value = goalId;
    contributionModal.classList.remove("hidden");
}

closeModalBtn.addEventListener("click", function() {
    contributionModal.classList.add("hidden");
    contributionForm.reset();
});

contributionForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const goalId = parseInt(selectedGoalId.value);
    const amount = parseFloat(document.getElementById("contributionAmount").value);

    if (amount <= 0) {
        alert("Contribution amount must be greater than 0.");
        return;
    }

    const goal = goals.find(g => g.id === goalId);

    if (!goal) return;

    goal.currentAmount += amount;

    if (goal.currentAmount > goal.targetAmount) {
        goal.currentAmount = goal.targetAmount;
    }

    renderGoals();

    contributionModal.classList.add("hidden");
    contributionForm.reset();
});

darkModeBtn.addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
});*/

// ===============================
// Goals Page UI Enhancements Only
// (No backend interference)
// ===============================


// Sidebar toggle (mobile menu)
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}


// Highlight active nav item (optional UX improvement)
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});


// Smooth scroll behavior (if needed in future sections)
document.documentElement.style.scrollBehavior = "smooth";


// Simple table row hover enhancement (UI feel)
const rows = document.querySelectorAll('.goals-table tbody tr');

rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
        row.style.transform = "scale(1.005)";
        row.style.transition = "0.2s ease";
    });

    row.addEventListener('mouseleave', () => {
        row.style.transform = "scale(1)";
    });
});


// Auto dismiss Django messages after 5 seconds
const messages = document.querySelectorAll('.messages-alerts li');

if (messages.length > 0) {
    setTimeout(() => {
        messages.forEach(msg => {
            msg.style.opacity = "0";
            msg.style.transition = "0.5s ease";
            setTimeout(() => msg.remove(), 500);
        });
    }, 5000);
}


// Optional: highlight completed goals visually
const goalNames = document.querySelectorAll('.goal-name.completed');

goalNames.forEach(goal => {
    goal.style.textDecoration = "line-through";
    goal.style.opacity = "0.7";
});


// Menu button accessibility improvement
if (menuToggle) {
    menuToggle.addEventListener('keydown', (e) => {
        if (e.key === "Enter" || e.key === " ") {
            sidebar.classList.toggle('open');
        }
    });
}