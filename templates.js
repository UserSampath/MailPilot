const emailTemplates = [
  {
    name: "Job Application",
    subject: "Application for [Job Title] - [Your Name]",
    content:
      "Dear [Hiring Manager],\n\nI am writing to apply for the [Job Title] position at [Company]. I believe my skills and experience make me a strong fit for this role.\n\nBest regards,\n[Your Name]"
  },
  {
    name: "Meeting Request",
    subject: "Request to Schedule Meeting on [Topic]",
    content:
      "Hi [Name],\n\nI hope this message finds you well. I’d like to schedule a meeting to discuss [Topic]. Please let me know your availability.\n\nThanks,\n[Your Name]"
  }
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

  let formHtml = <h3>Fill Template: ${template.name}</h3>;
  placeholders.forEach((ph) => {
    formHtml += `
      <label>${ph}</label>
      <input type="text" name="${ph}" class="ai-template-input" />
    `;
  });
  formHtml += <button id="apply-template-btn">Apply</button>;

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
      const regex = new RegExp(\\[${key}\\], "g");
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
const observer = new MutationObserver(() => {
  insertDropdown();
});
observer.observe(document.body, { childList: true, subtree: true });