// Study Plan JavaScript
class StudyPlanManager {
  constructor() {
    this.currentWeek = 1;
    this.totalTasks = 0;
    this.completedTasks = 0;
    this.weekProgress = { 1: 0, 2: 0, 3: 0, 4: 0 };

    this.init();
  }

  init() {
    this.loadState();
    this.bindEvents();
    this.calculateTotalTasks();
    this.updateAllProgress();
    this.updateProgressDisplay();

    // Set current year in footer
    document.getElementById("current-year").textContent =
      new Date().getFullYear();
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
