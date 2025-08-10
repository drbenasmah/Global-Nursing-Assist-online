// Study Plan JavaScript
class StudyPlanManager {
  constructor() {
    this.currentWeek = 1;
    this.totalTasks = 0;
    this.completedTasks = 0;
    this.weekProgress = { 1: 0, 2: 0, 3: 0, 4: 0 };
    this.bookmarks = new Set();
    this.notes = {};
    this.studyTimer = null;
    this.timerDuration = 25 * 60; // 25 minutes in seconds
    this.timerRemaining = this.timerDuration;

    this.init();
  }

  init() {
    this.loadState();
    this.bindEvents();
    this.calculateTotalTasks();
    this.updateAllProgress();
    this.updateProgressDisplay();
    this.initializeFeatherIcons();
    this.setupSearch();
    this.setupSettings();
    this.setupBookmarks();
    this.setupNotes();
    this.updateStats();

    // Set current year in footer if element exists
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  bindEvents() {
    // Week tab navigation
    document.querySelectorAll(".week-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const weekNum = parseInt(tab.dataset.week);
        this.switchWeek(weekNum);
      });
    });

    // Task checkbox changes
    document.querySelectorAll(".task-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        this.handleTaskToggle(e.target);
        this.saveState();
        this.updateAllProgress();
        this.updateProgressDisplay();
        this.addCheckAnimation(e.target);
      });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    // Bookmark day buttons
    document.querySelectorAll(".bookmark-day").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const week = btn.dataset.week;
        const day = btn.dataset.day;
        this.toggleBookmark(week, day, btn);
      });
    });

    // Add note buttons
    document.querySelectorAll(".add-note").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const week = btn.dataset.week;
        const day = btn.dataset.day;
        this.toggleNote(week, day);
      });
    });
  }

  switchWeek(weekNum) {
    // Update active tab
    document.querySelectorAll(".week-tab").forEach((tab) => {
      tab.classList.remove("active");
    });
    document.querySelector(`[data-week="${weekNum}"]`).classList.add("active");

    // Update active content
    document.querySelectorAll(".week-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.getElementById(`week-${weekNum}`).classList.add("active");

    this.currentWeek = weekNum;

    // Trigger entrance animation
    this.animateWeekEntry(weekNum);
  }

  animateWeekEntry(weekNum) {
    const weekContent = document.getElementById(`week-${weekNum}`);
    const dayCards = weekContent.querySelectorAll(".day-card");

    dayCards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";

      setTimeout(() => {
        card.style.transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, index * 100);
    });
  }

  handleTaskToggle(checkbox) {
    const taskItem = checkbox.closest(".task-item");

    if (checkbox.checked) {
      this.completedTasks++;
      taskItem.classList.add("completed");
      this.showTaskCompletionEffect(taskItem);
    } else {
      this.completedTasks--;
      taskItem.classList.remove("completed");
    }
  }

  addCheckAnimation(checkbox) {
    if (checkbox.checked) {
      const customCheckbox = checkbox.nextElementSibling;
      customCheckbox.style.transform = "scale(1.2)";
      setTimeout(() => {
        customCheckbox.style.transform = "scale(1)";
      }, 200);
    }
  }

  showTaskCompletionEffect(taskItem) {
    // Create a brief success effect
    taskItem.style.background = "rgba(16, 185, 129, 0.1)";
    setTimeout(() => {
      taskItem.style.background = "";
    }, 1000);

    // Show celebration animation for milestones
    if (this.completedTasks % 5 === 0) {
      this.showMilestoneAnimation();
    }
  }

  showMilestoneAnimation() {
    // Create confetti-like effect for milestones
    const celebration = document.createElement("div");
    celebration.innerHTML = "🎉";
    celebration.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 3rem;
            z-index: 1000;
            pointer-events: none;
            animation: celebration 2s ease-out forwards;
        `;

    document.body.appendChild(celebration);

    // Add celebration animation
    const style = document.createElement("style");
    style.textContent = `
            @keyframes celebration {
                0% { opacity: 1; transform: translateX(-50%) scale(0); }
                50% { opacity: 1; transform: translateX(-50%) scale(1.2); }
                100% { opacity: 0; transform: translateX(-50%) scale(1) translateY(-50px); }
            }
        `;
    document.head.appendChild(style);

    setTimeout(() => {
      document.body.removeChild(celebration);
      document.head.removeChild(style);
    }, 2000);
  }

  calculateTotalTasks() {
    this.totalTasks = document.querySelectorAll(".task-checkbox").length;
  }

  updateAllProgress() {
    this.calculateCompletedTasks();
    this.updateOverallProgress();
    this.updateWeekProgress();
    this.updateWeekTabProgress();
  }

  calculateCompletedTasks() {
    this.completedTasks = document.querySelectorAll(
      ".task-checkbox:checked"
    ).length;
  }

  updateOverallProgress() {
    const percentage =
      this.totalTasks > 0 ? (this.completedTasks / this.totalTasks) * 100 : 0;
    const progressFill = document.getElementById("overall-progress-fill");
    const progressPercentage = document.getElementById("progress-percentage");

    if (progressFill && progressPercentage) {
      progressFill.style.width = `${percentage}%`;
      progressPercentage.textContent = `${Math.round(percentage)}%`;
    }
  }

  updateWeekProgress() {
    for (let week = 1; week <= 4; week++) {
      const weekElement = document.getElementById(`week-${week}`);
      if (!weekElement) continue;

      const weekTasks = weekElement.querySelectorAll(".task-checkbox");
      const weekCompletedTasks = weekElement.querySelectorAll(
        ".task-checkbox:checked"
      );
      const weekPercentage =
        weekTasks.length > 0
          ? (weekCompletedTasks.length / weekTasks.length) * 100
          : 0;

      this.weekProgress[week] = weekPercentage;

      const weekProgressFill = document.getElementById(`week-${week}-fill`);
      if (weekProgressFill) {
        weekProgressFill.style.width = `${weekPercentage}%`;
      }
    }
  }

  updateWeekTabProgress() {
    for (let week = 1; week <= 4; week++) {
      const weekTab = document.querySelector(`[data-week="${week}"]`);
      const progressSpan = document.getElementById(`week-${week}-progress`);
      const checkIcon = weekTab.querySelector(".week-check");

      if (progressSpan) {
        progressSpan.textContent = `${Math.round(this.weekProgress[week])}%`;
      }

      if (this.weekProgress[week] === 100) {
        weekTab.classList.add("completed");
        if (checkIcon) {
          checkIcon.style.opacity = "1";
        }
      } else {
        weekTab.classList.remove("completed");
        if (checkIcon) {
          checkIcon.style.opacity = "0";
        }
      }
    }
  }

  updateProgressDisplay() {
    const progressText = document.getElementById("progress-text");
    if (progressText) {
      progressText.textContent = `${this.completedTasks} of ${this.totalTasks} tasks completed`;
    }
  }

  saveState() {
    const state = {
      completedTasks: [],
      currentWeek: this.currentWeek,
      bookmarks: Array.from(this.bookmarks),
      notes: this.notes,
    };

    document.querySelectorAll(".task-checkbox").forEach((checkbox, index) => {
      if (checkbox.checked) {
        state.completedTasks.push(index);
      }
    });

    localStorage.setItem("maltaStudyPlanState", JSON.stringify(state));
  }

  loadState() {
    const savedState = localStorage.getItem("maltaStudyPlanState");
    if (!savedState) return;

    try {
      const state = JSON.parse(savedState);

      // Restore checkbox states
      const checkboxes = document.querySelectorAll(".task-checkbox");
      state.completedTasks.forEach((index) => {
        if (checkboxes[index]) {
          checkboxes[index].checked = true;
          checkboxes[index].closest(".task-item").classList.add("completed");
        }
      });

      // Restore current week
      if (state.currentWeek) {
        this.switchWeek(state.currentWeek);
      }

      // Restore bookmarks
      if (state.bookmarks) {
        this.bookmarks = new Set(state.bookmarks);
        state.bookmarks.forEach((bookmark) => {
          const [week, day] = bookmark.split("-");
          const btn = document.querySelector(
            `[data-week="${week}"][data-day="${day}"].bookmark-day`
          );
          if (btn) btn.classList.add("active");
        });
      }

      // Restore notes
      if (state.notes) {
        this.notes = state.notes;
      }
    } catch (error) {
      console.error("Error loading saved state:", error);
    }
  }

  // Utility method to reset all progress
  resetProgress() {
    if (
      confirm(
        "Are you sure you want to reset all progress? This action cannot be undone."
      )
    ) {
      localStorage.removeItem("maltaStudyPlanState");
      document.querySelectorAll(".task-checkbox").forEach((checkbox) => {
        checkbox.checked = false;
        checkbox.closest(".task-item").classList.remove("completed");
      });
      this.updateAllProgress();
      this.updateProgressDisplay();
    }
  }

  // Export progress as JSON
  exportProgress() {
    const state = {
      exportDate: new Date().toISOString(),
      totalTasks: this.totalTasks,
      completedTasks: this.completedTasks,
      overallProgress: Math.round(
        (this.completedTasks / this.totalTasks) * 100
      ),
      weekProgress: this.weekProgress,
      taskDetails: [],
    };

    document.querySelectorAll(".task-list").forEach((taskList) => {
      const week = taskList.dataset.week;
      const day = taskList.dataset.day;

      taskList.querySelectorAll(".task-item").forEach((item, index) => {
        const checkbox = item.querySelector(".task-checkbox");
        const taskText = item.querySelector(".task-text").textContent;

        state.taskDetails.push({
          week: parseInt(week),
          day: parseInt(day),
          taskIndex: index,
          taskText: taskText,
          completed: checkbox.checked,
        });
      });
    });

    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `malta-study-plan-progress-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  // Initialize Feather Icons
  initializeFeatherIcons() {
    if (typeof feather !== "undefined") {
      feather.replace();
    }
  }

  // Setup Search Functionality
  setupSearch() {
    const searchToggle = document.getElementById("search-toggle");
    const searchBar = document.getElementById("search-bar");
    const searchInput = document.getElementById("search-input");
    const searchClose = document.getElementById("search-close");
    const searchResults = document.getElementById("search-results");

    if (searchToggle && searchBar) {
      searchToggle.addEventListener("click", () => {
        searchBar.classList.toggle("hidden");
        if (!searchBar.classList.contains("hidden")) {
          searchInput.focus();
        }
      });

      searchClose.addEventListener("click", () => {
        searchBar.classList.add("hidden");
        searchInput.value = "";
        searchResults.classList.add("hidden");
      });

      searchInput.addEventListener("input", (e) => {
        this.performSearch(e.target.value);
      });
    }
  }

  performSearch(query) {
    const searchResults = document.getElementById("search-results");
    if (!query.trim()) {
      searchResults.classList.add("hidden");
      return;
    }

    const results = [];
    const searchData = this.getSearchableContent();

    searchData.forEach((item) => {
      if (
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push(item);
      }
    });

    this.displaySearchResults(results);
  }

  getSearchableContent() {
    const searchData = [];
    document.querySelectorAll(".day-card").forEach((card) => {
      const week = card.closest(".week-content").id.replace("week-", "");
      const day = card.dataset.day;
      const title = card.querySelector("h4").textContent;
      const tasks = Array.from(card.querySelectorAll(".task-text")).map(
        (t) => t.textContent
      );

      searchData.push({
        week,
        day,
        title,
        content: tasks.join(" "),
        element: card,
      });
    });
    return searchData;
  }

  displaySearchResults(results) {
    const searchResults = document.getElementById("search-results");

    if (results.length === 0) {
      searchResults.innerHTML =
        '<div class="search-result-item">No results found</div>';
    } else {
      searchResults.innerHTML = results
        .map(
          (result) => `
                <div class="search-result-item" data-week="${result.week}" data-day="${result.day}">
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-meta">Week ${result.week}, Day ${result.day}</div>
                </div>
            `
        )
        .join("");

      searchResults.querySelectorAll(".search-result-item").forEach((item) => {
        item.addEventListener("click", () => {
          const week = parseInt(item.dataset.week);
          this.switchWeek(week);
          document.getElementById("search-bar").classList.add("hidden");
        });
      });
    }

    searchResults.classList.remove("hidden");
  }

  // Setup Settings Panel
  setupSettings() {
    const settingsToggle = document.getElementById("settings-toggle");
    const settingsPanel = document.getElementById("settings-panel");
    const settingsClose = document.getElementById("settings-close");
    const startTimer = document.getElementById("start-timer");
    const stopTimer = document.getElementById("stop-timer");
    const timerMinutes = document.getElementById("timer-minutes");
    const exportBtn = document.getElementById("export-progress");
    const resetBtn = document.getElementById("reset-progress");

    if (settingsToggle && settingsPanel) {
      settingsToggle.addEventListener("click", () => {
        settingsPanel.classList.toggle("active");
      });

      settingsClose.addEventListener("click", () => {
        settingsPanel.classList.remove("active");
      });

      startTimer.addEventListener("click", () => this.startStudyTimer());
      stopTimer.addEventListener("click", () => this.stopStudyTimer());
      timerMinutes.addEventListener("change", (e) => {
        this.timerDuration = parseInt(e.target.value) * 60;
        this.timerRemaining = this.timerDuration;
        this.updateTimerDisplay();
      });

      exportBtn.addEventListener("click", () => this.exportProgress());
      resetBtn.addEventListener("click", () => this.resetProgress());
    }
  }

  startStudyTimer() {
    const startBtn = document.getElementById("start-timer");
    const stopBtn = document.getElementById("stop-timer");

    if (this.studyTimer) return;

    startBtn.disabled = true;
    stopBtn.disabled = false;

    this.studyTimer = setInterval(() => {
      this.timerRemaining--;
      this.updateTimerDisplay();

      if (this.timerRemaining <= 0) {
        this.stopStudyTimer();
        this.showTimerComplete();
      }
    }, 1000);
  }

  stopStudyTimer() {
    const startBtn = document.getElementById("start-timer");
    const stopBtn = document.getElementById("stop-timer");

    if (this.studyTimer) {
      clearInterval(this.studyTimer);
      this.studyTimer = null;
    }

    startBtn.disabled = false;
    stopBtn.disabled = true;

    this.timerRemaining = this.timerDuration;
    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    const display = document.getElementById("timer-display");
    const minutes = Math.floor(this.timerRemaining / 60);
    const seconds = this.timerRemaining % 60;
    display.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  showTimerComplete() {
    alert("Study session complete! Great job! 🎉");
  }

  // Setup Bookmarks
  setupBookmarks() {
    const bookmarksBtn = document.getElementById("bookmarks-btn");
    const bookmarksMenu = document.getElementById("bookmarks-menu");

    if (bookmarksBtn && bookmarksMenu) {
      bookmarksBtn.addEventListener("click", () => {
        bookmarksMenu.classList.toggle("hidden");
        this.updateBookmarksMenu();
      });

      document.addEventListener("click", (e) => {
        if (
          !bookmarksBtn.contains(e.target) &&
          !bookmarksMenu.contains(e.target)
        ) {
          bookmarksMenu.classList.add("hidden");
        }
      });
    }
  }

  toggleBookmark(week, day, btn) {
    const bookmarkKey = `${week}-${day}`;

    if (this.bookmarks.has(bookmarkKey)) {
      this.bookmarks.delete(bookmarkKey);
      btn.classList.remove("active");
    } else {
      this.bookmarks.add(bookmarkKey);
      btn.classList.add("active");
    }

    this.saveState();
  }

  updateBookmarksMenu() {
    const bookmarksMenu = document.getElementById("bookmarks-menu");

    if (this.bookmarks.size === 0) {
      bookmarksMenu.innerHTML =
        '<div class="bookmark-item">No bookmarks yet</div>';
    } else {
      const bookmarkItems = Array.from(this.bookmarks)
        .map((bookmark) => {
          const [week, day] = bookmark.split("-");
          const dayCard = document.querySelector(
            `[data-week="${week}"] [data-day="${day}"]`
          );
          const title = dayCard
            ? dayCard.querySelector("h4").textContent
            : `Week ${week}, Day ${day}`;

          return `<div class="bookmark-item" data-week="${week}" data-day="${day}">${title}</div>`;
        })
        .join("");

      bookmarksMenu.innerHTML = bookmarkItems;

      bookmarksMenu.querySelectorAll(".bookmark-item").forEach((item) => {
        item.addEventListener("click", () => {
          const week = parseInt(item.dataset.week);
          this.switchWeek(week);
          document.getElementById("bookmarks-menu").classList.add("hidden");
        });
      });
    }
  }

  // Setup Notes
  setupNotes() {
    // Notes functionality is handled by toggleNote method
  }

  toggleNote(week, day) {
    const noteId = `notes-${week}-${day}`;
    const noteElement = document.getElementById(noteId);

    if (noteElement) {
      noteElement.classList.toggle("active");

      if (
        noteElement.classList.contains("active") &&
        !noteElement.querySelector("textarea")
      ) {
        const textarea = document.createElement("textarea");
        textarea.placeholder = "Add your notes here...";
        textarea.value = this.notes[`${week}-${day}`] || "";
        textarea.addEventListener("input", (e) => {
          this.notes[`${week}-${day}`] = e.target.value;
          this.saveState();
        });
        noteElement.appendChild(textarea);
      }
    }
  }

  updateStats() {
    const totalTasksElement = document.getElementById("total-tasks");
    const completedTasksElement = document.getElementById("completed-tasks");
    const studyStreakElement = document.getElementById("study-streak");

    if (totalTasksElement) totalTasksElement.textContent = this.totalTasks;
    if (completedTasksElement)
      completedTasksElement.textContent = this.completedTasks;
    if (studyStreakElement)
      studyStreakElement.textContent = this.calculateStreak();
  }

  calculateStreak() {
    // Simple streak calculation based on consecutive days with completed tasks
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toDateString();

      // This is a simplified version - in a real app you'd track daily progress
      if (this.completedTasks > i * 2) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}

// Smooth scrolling utility
function smoothScrollTo(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// Add keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Press 1-4 to switch weeks
  if (e.key >= "1" && e.key <= "4" && !e.ctrlKey && !e.altKey) {
    const weekNum = parseInt(e.key);
    studyPlan.switchWeek(weekNum);
  }

  // Ctrl+R to reset progress
  if (e.ctrlKey && e.key === "r") {
    e.preventDefault();
    studyPlan.resetProgress();
  }

  // Ctrl+E to export progress
  if (e.ctrlKey && e.key === "e") {
    e.preventDefault();
    studyPlan.exportProgress();
  }
});

// Add touch gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe left - next week
      const nextWeek = Math.min(studyPlan.currentWeek + 1, 4);
      studyPlan.switchWeek(nextWeek);
    } else {
      // Swipe right - previous week
      const prevWeek = Math.max(studyPlan.currentWeek - 1, 1);
      studyPlan.switchWeek(prevWeek);
    }
  }
}

// Initialize the study plan when DOM is loaded
let studyPlan;
document.addEventListener("DOMContentLoaded", () => {
  studyPlan = new StudyPlanManager();

  // Navbar scroll elevation (UI only)
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 8) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Add visual feedback for interactions
  document.querySelectorAll(".day-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-3px)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)";
    });
  });

  // Add loading animation
  document.body.classList.add("loading");
  setTimeout(() => {
    document.body.classList.remove("loading");
  }, 500);
});

// Add performance monitoring
window.addEventListener("load", () => {
  // Log performance metrics
  const perfData = performance.getEntriesByType("navigation")[0];
  console.log(
    `Page loaded in ${Math.round(
      perfData.loadEventEnd - perfData.loadEventStart
    )}ms`
  );
});

// Service worker registration for offline capability (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Uncomment to enable service worker
    // navigator.serviceWorker.register('/sw.js')
    //     .then((registration) => {
    //         console.log('SW registered: ', registration);
    //     })
    //     .catch((registrationError) => {
    //         console.log('SW registration failed: ', registrationError);
    //     });
  });
}
