const emailTemplates = [
  {
    name: "Job Application",
    subject: "Application for [Job Title] - [Your Name]",
    content:
      "Dear [Hiring Manager],\n\nI am writing to apply for the [Job Title] position at [Company]. With my experience in [Your Expertise/Field], I am confident I can contribute effectively to your team. I would welcome the opportunity to discuss my qualifications further.\n\nBest regards,\n[Your Name]",
  },
  {
    name: "Meeting Request",
    subject: "Request to Schedule Meeting on [Topic]",
    content:
      "Hi [Recipient Name],\n\nI hope this message finds you well. I’d like to schedule a meeting to discuss [Topic]. Please let me know your availability for this week or next.\n\nThank you,\n[Your Name]",
  },
  {
    name: "Follow-Up",
    subject: "Following Up on [Topic/Previous Conversation]",
    content:
      "Hi [Recipient Name],\n\nI wanted to follow up regarding [Topic/Previous Conversation]. Please let me know if you need any additional information from my side. Looking forward to your response.\n\nBest regards,\n[Your Name]",
  },
  {
    name: "Thank You",
    subject: "Thank You for [Meeting/Interview/Opportunity]",
    content:
      "Dear [Recipient Name],\n\nThank you for taking the time to [meet/interview/speak] with me regarding [Topic]. I greatly appreciate the opportunity and look forward to staying in touch.\n\nBest regards,\n[Your Name]",
  },
  {
    name: "Project Update",
    subject: "Update on [Project Name]",
    content:
      "Hi [Recipient Name],\n\nI wanted to provide you with an update on [Project Name]. So far, we have completed [Task/Phase] and are on track to meet the upcoming milestones. Please let me know if you have any feedback or questions.\n\nThanks,\n[Your Name]",
  },
  {
    name: "Networking/Introduction",
    subject: "Introduction: [Your Name] & [Recipient Name]",
    content:
      "Hi [Recipient Name],\n\nI wanted to introduce myself. I am [Your Name], working in [Your Field/Company]. I would love to connect and discuss potential opportunities or collaborations.\n\nBest regards,\n[Your Name]",
  },
  {
    name: "Request for Feedback",
    subject: "Requesting Feedback on [Document/Project]",
    content:
      "Hi [Recipient Name],\n\nI have completed [Document/Project] and would greatly appreciate your feedback. Your insights will help improve the final outcome. Please let me know your thoughts when convenient.\n\nThank you,\n[Your Name]",
  },
];

// Extract placeholders like [Job Title]
function extractPlaceholders(templateText) {
  const regex = /\[([^\]]+)\]/g;
  const placeholders = new Set();
  let match;
  while ((match = regex.exec(templateText)) !== null) {
    placeholders.add(match[1]);
  }
  return Array.from(placeholders);
}

function showTemplateForm(template) {
  // Remove old modal
  let oldModal = document.querySelector(".ai-template-modal");
  if (oldModal) oldModal.remove();

  const modal = document.createElement("div");
  modal.className = "ai-template-modal";

  const placeholders = extractPlaceholders(
    template.subject + " " + template.content
  );

  let formHtml = `<h3>Fill Template: ${template.name}</h3>`;
  placeholders.forEach((ph) => {
    formHtml += `
      <label>${ph}</label>
      <input type="text" name="${ph}" class="ai-template-input" />
    `;
  });
  formHtml += `<button id="apply-template-btn">Apply</button>`;

  modal.innerHTML = formHtml;
  document.body.appendChild(modal);

  // Apply button
  modal.querySelector("#apply-template-btn").addEventListener("click", () => {
    const inputs = modal.querySelectorAll(".ai-template-input");
    let replacements = {};
    inputs.forEach((input) => {
      replacements[input.name] = input.value;
    });

    // Replace placeholders
    let finalSubject = template.subject;
    let finalContent = template.content;
    for (let key in replacements) {
      const regex = new RegExp(`\\[${key}\\]`, "g");
      finalSubject = finalSubject.replace(regex, replacements[key]);
      finalContent = finalContent.replace(regex, replacements[key]);
    }

    // Fill Gmail fields
    const subjectBox = document.querySelector('input[name="subjectbox"]');
    if (subjectBox) {
      subjectBox.value = finalSubject;
      subjectBox.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const composeBox = document.querySelector(
      '[role="textbox"][g_editable="true"]'
    );
    if (composeBox) {
      composeBox.focus();
      document.execCommand("insertText", false, finalContent);
    }

    modal.remove();
  });
}

function createTemplateDropdown() {
  const select = document.createElement("select");
  select.className = "ai-template-dropdown";
  select.style.marginRight = "8px";

  const defaultOption = document.createElement("option");
  defaultOption.text = "Select Template";
  defaultOption.value = "";
  select.appendChild(defaultOption);

  emailTemplates.forEach((template, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.text = template.name;
    select.appendChild(option);
  });

  select.addEventListener("change", () => {
    const selectedIndex = select.value;
    if (selectedIndex !== "") {
      const template = emailTemplates[selectedIndex];
      showTemplateForm(template);
    }
    select.value = "";
  });

  return select;
}

// Insert dropdown into Gmail compose toolbar
function insertDropdown() {
  const toolbar = document.querySelector(".aDh"); // Gmail compose toolbar
  if (toolbar && !document.querySelector(".ai-template-dropdown")) {
    const dropdown = createTemplateDropdown();
    toolbar.prepend(dropdown);
  }
}

// MutationObserver: wait for compose windows
// const observer = new MutationObserver(() => {
//   insertDropdown();
// });

const observer = new MutationObserver((mutations) => {
  insertDropdown();
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    const hasComposeElements = addedNodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches('.aDh, .btC, [role="dialog"]') ||
          node.querySelector('.aDh, .btC, [role="dialog"]'))
    );

    if (hasComposeElements) {
      console.log("Compose Window Detected");
      setTimeout(injectButton, 500);
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });

console.log("Email Writer Extension - Content Script Loaded");

function createAIButton() {
  const button = document.createElement("div");
  button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3";
  button.style.marginRight = "8px";
  button.innerHTML = "AI Reply";
  button.setAttribute("role", "button");
  button.setAttribute("data-tooltip", "Generate AI Reply");
  return button;
}

function getEmailContent() {
  const selectors = [
    ".h7",
    ".a3s.aiL",
    ".gmail_quote",
    '[role="presentation"]',
  ];
  for (const selector of selectors) {
    const content = document.querySelector(selector);
    if (content) {
      return content.innerText.trim();
    }
    return "";
  }
}

function findComposeToolbar() {
  const selectors = [".btC", ".aDh", '[role="toolbar"]', ".gU.Up"];
  for (const selector of selectors) {
    const toolbar = document.querySelector(selector);
    if (toolbar) {
      return toolbar;
    }
    return null;
  }
}

function injectButton() {
  const existingButton = document.querySelector(".ai-reply-button");
  if (existingButton) existingButton.remove();

  const toolbar = findComposeToolbar();
  if (!toolbar) {
    console.log("Toolbar not found");
    return;
  }

  console.log("Toolbar found, creating AI button");
  const button = createAIButton();
  button.classList.add("ai-reply-button");

  button.addEventListener("click", async () => {
    try {
      button.innerHTML = "Generating...";
      button.disabled = true;

      const emailContent = getEmailContent();
      const response = await fetch("http://localhost:8080/api/email/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailContent: emailContent,
          tone: "professional",
        }),
      });

      if (!response.ok) {
        throw new Error("API Request Failed");
      }

      const generatedReply = await response.text();
      const composeBox = document.querySelector(
        '[role="textbox"][g_editable="true"]'
      );

      if (composeBox) {
        composeBox.focus();
        document.execCommand("insertText", false, generatedReply);
      } else {
        console.error("Compose box was not found");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate reply");
    } finally {
      button.innerHTML = "AI Reply";
      button.disabled = false;
    }
  });

  toolbar.insertBefore(button, toolbar.firstChild);
}
