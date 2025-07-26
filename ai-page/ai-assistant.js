// AI Assistant functionality
class NursingAIAssistant {
  constructor() {
    this.chatWindow = document.getElementById("chat-window");
    this.chatInput = document.getElementById("chat-input");
    this.sendButton = document.getElementById("send-button");
    this.chatInputForm = document.getElementById("chat-input-form");

    this.init();
    this.showChatInterface(); // Show chat interface immediately
  }

  init() {
    // Event listeners
    this.sendButton.addEventListener("click", () => this.sendMessage());
    this.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Initialize prompt buttons
    document.querySelectorAll(".prompt-button").forEach((button) => {
      button.addEventListener("click", () => {
        const prompt = button.dataset.prompt;
        this.chatInput.value = prompt;
        this.sendMessage();
      });
    });
  }

  async sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    // Clear input and disable button
    this.chatInput.value = "";
    this.sendButton.disabled = true;

    // Add user message
    this.addMessage(message, "user");

    // Show typing indicator
    this.showTypingIndicator();

    try {
      const response = await this.callPerplexityAPI(message);
      this.hideTypingIndicator();
      this.addMessage(response, "assistant");
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage(
        "Sorry, I encountered an error. Please try again.",
        "assistant"
      );
      console.error("API Error:", error);
    }

    this.sendButton.disabled = false;
  }

  async callPerplexityAPI(message) {
    // Using HuggingFace's Inference API (free tier available)
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`, // Get free API key from huggingface.co
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {
            text: message,
            past_user_inputs: [],
            generated_responses: [],
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.generated_text;
  }

  addMessage(content, type) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${type}`;

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.innerHTML =
      type === "user"
        ? '<i data-feather="user"></i>'
        : '<i data-feather="user-check"></i>';

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    messageContent.innerHTML = `<p>${content}</p>`;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);

    // Insert before starter prompts or at the end
    const starterPrompts = this.chatWindow.querySelector(".starter-prompts");
    if (starterPrompts) {
      this.chatWindow.insertBefore(messageDiv, starterPrompts);
    } else {
      this.chatWindow.appendChild(messageDiv);
    }

    // Replace feather icons
    feather.replace();

    // Scroll to bottom
    this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
  }

  showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "chat-message assistant typing-indicator";
    typingDiv.id = "typing-indicator";

    typingDiv.innerHTML = `
            <div class="chat-avatar">
                <i data-feather="user-check"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    Typing
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;

    const starterPrompts = this.chatWindow.querySelector(".starter-prompts");
    if (starterPrompts) {
      this.chatWindow.insertBefore(typingDiv, starterPrompts);
    } else {
      this.chatWindow.appendChild(typingDiv);
    }

    feather.replace();
    this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
}

// Initialize the AI Assistant when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new NursingAIAssistant();
});
