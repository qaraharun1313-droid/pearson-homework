const state = { questions: [] };

const el = (id) => document.getElementById(id);
const dialog = el("questionDialog");

function syncPreview() {
  el("previewTitle").textContent = el("title").value || "Untitled Assignment";
  el("previewSubject").textContent = `${el("subject").value || "English"} • ${el("grade").value}`;
  el("previewInstructions").textContent = el("instructions").value;
  el("previewName").textContent = el("studentName").value;
}

["title", "subject", "grade", "studentName", "instructions"].forEach((id) => {
  el(id).addEventListener("input", syncPreview);
  el(id).addEventListener("change", syncPreview);
});

function openDialog(type) {
  el("questionForm").reset();
  el("questionType").value = type;
  el("choiceFields").hidden = type !== "multiple";
  el("answerField").hidden = type === "multiple" || type === "matching";
  el("matchingFields").hidden = type !== "matching";

  const titles = { multiple: "Add multiple choice", short: "Add short answer", fill: "Add fill in the blank", matching: "Add matching" };
  el("dialogTitle").textContent = titles[type];
  el("promptField").queryContent = "";
  dialog.showModal();
}

document.querySelectorAll("[data-type]").forEach((button) => {
  button.addEventListener("click", () => openDialog(button.dataset.type));
});

el("cancelButton").addEventListener("click", () => dialog.close());

el("questionForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const type = el("questionType").value;
  const prompt = el("prompt").value.trim();
  if (!prompt) return;

  let question = { type, prompt };
  if (type === "multiple") {
    question.options = [...document.querySelectorAll(".choice")].map((input) => input.value.trim());
    question.answer = el("correctChoice").value;
  } else if (type === "matching") {
    question.left = el("matchLeft").value.split("\n").map((item) => item.trim()).filter(Boolean);
    question.right = el("matchRight").value.split("\n").map((item) => item.trim()).filter(Boolean);
  } else {
    question.answer = el("answer").value.trim();
  }

  state.questions.push(question);
  dialog.close();
  render();
});

function render() {
  const container = el("questions");
  const key = el("answerKey");
  container.innerHTML = "";
  key.innerHTML = "";

  el("questionCount").textContent = `${state.questions.length} question${state.questions.length === 1 ? "" : "s"}`;

  state.questions.forEach((question, index) => {
    const number = index + 1;
    const block = document.createElement("section");
    block.className = "question";

    let content = `<p class="question-text">${number}. ${escapeHtml(question.prompt)}</p>`;
    if (question.type === "multiple") {
      content += '<div class="options">';
      question.options.forEach((option, i) => {
        content += `<div class="option">${String.fromCharCode(65 + i)}. ${escapeHtml(option)}</div>`;
      });
      content += "</div>";
    } else if (question.type === "matching") {
      content += '<div class="matching-grid"><div>';
      question.left.forEach((item, i) => content += `<div class="match-item"><span class="match-box"></span><span>${i + 1}. ${escapeHtml(item)}</span></div>`);
      content += "</div><div>";
      question.right.forEach((item, i) => content += `<div class="match-item"><span>${String.fromCharCode(65 + i)}. ${escapeHtml(item)}</span></div>`);
      content += "</div></div>";
    } else {
      content += '<div class="answer-lines"></div>';
    }

    block.innerHTML = content;
    container.appendChild(block);

    const answer = document.createElement("p");
    answer.textContent = `${number}. ${question.answer || "—"}`;
    key.appendChild(answer);
  });
}

function escapeHtml(value) {
  const node = document.createElement("span");
  node.textContent = value;
  return node.innerHTML;
}

el("clearButton").addEventListener("click", () => {
  if (state.questions.length && confirm("Clear all questions?")) {
    state.questions = [];
    render();
  }
});

el("printButton").addEventListener("click", () => window.print());
syncPreview();
render();
