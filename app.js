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
const sendButton = chatForm.querySelector("button[type='submit']");

const daySystemPrompts = {
  1: "You are a Linux tutor strictly teaching the CLI and filesystem.",
  2: "You are a Linux tutor teaching file operations and command navigation.",
  3: "You are a Linux tutor teaching users, groups, permissions, and sudo safety.",
  4: "You are a Linux tutor teaching package management with apt and repositories.",
  5: "You are a Linux tutor teaching Linux editors, configs, and directory standards.",
  6: "You are a Linux tutor teaching process management and system monitoring.",
  7: "You are a Linux tutor teaching bash scripting fundamentals and automation.",
  8: "You are a Linux tutor teaching Linux networking basics, ports, DNS, and diagnostics.",
  9: "You are a Linux tutor teaching SSH, key-based auth, and secure remote access.",
  10: "You are a Linux tutor teaching web server setup, reverse proxy, and deployment checks.",
  11: "You are a Linux tutor teaching systemd services, units, and restart behavior.",
  12: "You are a Linux tutor teaching Docker images, containers, and runtime operations.",
  13: "You are a Linux tutor teaching AI runtime setup with Python environments and dependencies.",
  14: "You are a Linux tutor teaching production hardening, monitoring, and launch readiness."
};

const storagePrefix = "ubuntuAiTutor.chat.day";
let activeDay = null;

function getStorageKey(day) {
  return `${storagePrefix}.${day}`;
}

function loadDayHistory(day) {
  const raw = localStorage.getItem(getStorageKey(day));

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function saveDayHistory(day, messages) {
  localStorage.setItem(getStorageKey(day), JSON.stringify(messages));
}

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
  return bubble;
}

function renderDayHistory(day) {
  const messages = loadDayHistory(day);
  chatHistory.innerHTML = "";

  messages.forEach((message) => {
    appendMessage(message.role, message.text);
  });
}

function openModal(dayLesson) {
  activeDay = dayLesson;
  modalTitle.textContent = `Day ${dayLesson.day} Tutor`;

  renderDayHistory(dayLesson.day);

  if (!chatHistory.children.length) {
    appendMessage("tutor", `Welcome to Day ${dayLesson.day}. Ask your Linux questions here.`);
  }

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

async function sendMessage() {
  if (!activeDay) {
    return;
  }

  const message = chatInput.value.trim();
  if (!message) {
    return;
  }

  appendMessage("user", message);

  const day = activeDay.day;
  const history = loadDayHistory(day);
  history.push({ role: "user", text: message, createdAt: Date.now() });
  saveDayHistory(day, history);

  chatInput.value = "";

  const typingBubble = appendMessage("tutor", "Typing...");
  chatInput.disabled = true;
  if (sendButton) {
    sendButton.disabled = true;
  }

  try {
    const systemPrompt = daySystemPrompts[day] || "You are a Linux tutor.";
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemPrompt,
        chatHistory: history
      })
    });

    const data = await response.json();

    if (!response.ok || typeof data.reply !== "string") {
      throw new Error(data.error || "Failed to get AI response.");
    }

    typingBubble.remove();
    const tutorReply = data.reply.trim();
    appendMessage("tutor", tutorReply);

    const updatedHistory = loadDayHistory(day);
    updatedHistory.push({ role: "tutor", text: tutorReply, createdAt: Date.now() });
    saveDayHistory(day, updatedHistory);
  } catch (error) {
    typingBubble.remove();
    appendMessage("tutor", `Sorry, I hit an error: ${error instanceof Error ? error.message : "Unknown error"}`);
  } finally {
    chatInput.disabled = false;
    if (sendButton) {
      sendButton.disabled = false;
    }
    chatInput.focus();
  }
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});

renderCards();
