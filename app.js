const curriculum = [
  {
    day: 1,
    week: 1,
    title: "What is Ubuntu & the terminal?",
    description: "Understand Linux basics, terminal structure, and why CLI skills matter for modern development."
  },
  {
    day: 2,
    week: 1,
    title: "Essential commands",
    description: "Use navigation, file operations, and command help tools to work confidently in any Ubuntu shell."
  },
  {
    day: 3,
    week: 1,
    title: "Users, permissions, and sudo",
    description: "Learn ownership, chmod/chown, and safe privilege escalation using sudo with practical examples."
  },
  {
    day: 4,
    week: 1,
    title: "Package management",
    description: "Install, update, and troubleshoot software using apt while keeping your environment reliable."
  },
  {
    day: 5,
    week: 1,
    title: "Files, editors, and config",
    description: "Edit and manage configuration files with nano/vim and understand common Linux directory conventions."
  },
  {
    day: 6,
    week: 1,
    title: "Processes and monitoring",
    description: "Inspect running services, manage process lifecycles, and interpret CPU/RAM usage with core tools."
  },
  {
    day: 7,
    week: 1,
    title: "Shell scripting fundamentals",
    description: "Write simple bash scripts to automate repetitive setup and maintenance tasks efficiently."
  },
  {
    day: 8,
    week: 2,
    title: "Networking essentials",
    description: "Understand IPs, ports, DNS, and connection testing for server-side troubleshooting and deployment."
  },
  {
    day: 9,
    week: 2,
    title: "SSH and remote operations",
    description: "Securely connect to servers, manage keys, and perform safe remote administration workflows."
  },
  {
    day: 10,
    week: 2,
    title: "Web server setup",
    description: "Deploy a basic app with Nginx, configure reverse proxy behavior, and verify service availability."
  },
  {
    day: 11,
    week: 2,
    title: "Systemd and service control",
    description: "Create and manage persistent services, restart policies, and logs for production-like reliability."
  },
  {
    day: 12,
    week: 2,
    title: "Containers with Docker",
    description: "Package an app into containers, map ports, and manage images for consistent deployments."
  },
  {
    day: 13,
    week: 2,
    title: "AI runtime setup",
    description: "Prepare Python environments, dependencies, and inference tooling for lightweight AI workflows."
  },
  {
    day: 14,
    week: 2,
    title: "Production checklist",
    description: "Review security, backups, monitoring, and launch readiness for a stable Ubuntu AI stack."
  }
];

const curriculumGrid = document.getElementById("curriculumGrid");
const chatModal = document.getElementById("chatModal");
const closeModalBtn = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const chatHistory = document.getElementById("chatHistory");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

let activeDay = null;

function renderCards() {
  curriculumGrid.innerHTML = "";

  curriculum.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `day-card week-${item.week}`;
    button.setAttribute("aria-label", `Open Day ${item.day} chat`);

    button.innerHTML = `
      <span class="day-pill">Day ${item.day}</span>
      <h3 class="day-title">${item.title}</h3>
      <p class="day-desc">${item.description}</p>
    `;

    button.addEventListener("click", () => openModal(item));
    curriculumGrid.appendChild(button);
  });
}

function appendMessage(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  chatHistory.appendChild(bubble);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function openModal(dayLesson) {
  activeDay = dayLesson;
  modalTitle.textContent = `Day ${dayLesson.day}: ${dayLesson.title}`;
  chatHistory.innerHTML = "";

  appendMessage(
    "tutor",
    `Welcome to Day ${dayLesson.day}. Ask anything about: ${dayLesson.title}`
  );

  chatModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  chatInput.focus();
}

function closeModal() {
  chatModal.classList.add("hidden");
  document.body.style.overflow = "";
  activeDay = null;
}

closeModalBtn.addEventListener("click", closeModal);

chatModal.addEventListener("click", (event) => {
  if (event.target === chatModal) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !chatModal.classList.contains("hidden")) {
    closeModal();
  }
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = chatInput.value.trim();
  if (!message) {
    return;
  }

  appendMessage("user", message);
  chatInput.value = "";

  const fallbackTitle = activeDay ? activeDay.title : "today's lesson";
  appendMessage(
    "tutor",
    `Good question. For ${fallbackTitle}, focus on one command at a time and test it in your terminal before moving on.`
  );
});

renderCards();
