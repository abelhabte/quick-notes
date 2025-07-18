interface Note {
  id: string;
  title: string;
  content: string;
}

let notes: Note[] = [];
let editingNoteId: string | null = null;

// Centralized DOM element references
const elements = {
  notesContainer: document.getElementById("notesContainer") as HTMLElement,
  noteDialog: document.getElementById("noteDialog") as HTMLDialogElement,
  noteTitleInput: document.getElementById("noteTitle") as HTMLInputElement,
  noteContentInput: document.getElementById(
    "noteContent"
  ) as HTMLTextAreaElement,
  dialogTitle: document.getElementById("dialogTitle") as HTMLElement,
  noteForm: document.getElementById("noteForm") as HTMLFormElement,
  themeToggleBtn: document.getElementById(
    "themeToggleBtn"
  ) as HTMLButtonElement,
  accentColorPicker: document.getElementById(
    "accentColorPicker"
  ) as HTMLInputElement,
  fontSelector: document.getElementById("fontSelector") as HTMLSelectElement,
  addNoteBtn: document.querySelector(".add-note-btn") as HTMLButtonElement,
  saveNoteBtn: document.querySelector(".save-btn") as HTMLButtonElement,
};

// Helper function to update button color based on accent color
function updateButtonColor(
  button: HTMLButtonElement,
  accentColor: string
): void {
  if (button) {
    button.style.color = isColorLight(accentColor) ? "black" : "white";
  }
}

function loadNotes(): Note[] {
  const savedNotes = localStorage.getItem("quickNotes");
  return savedNotes ? (JSON.parse(savedNotes) as Note[]) : [];
}

function saveNote(event: Event): void {
  event.preventDefault();

  const title = elements.noteTitleInput.value.trim();
  const content = elements.noteContentInput.value.trim();

  if (editingNoteId) {
    const noteIndex = notes.findIndex((note) => note.id === editingNoteId);
    if (noteIndex !== -1) {
      notes[noteIndex] = { ...notes[noteIndex], title, content };
    }
  } else {
    notes.unshift({ id: generateId(), title, content });
  }

  closeNoteDialog();
  saveNotesToLocalStorage();
  renderNotes();
}

function generateId(): string {
  return Date.now().toString();
}

function saveNotesToLocalStorage(): void {
  localStorage.setItem("quickNotes", JSON.stringify(notes));
}

function deleteNote(noteId: string): void {
  notes = notes.filter((note) => note.id !== noteId);
  saveNotesToLocalStorage();
  renderNotes();
}

function renderNotes(): void {
  if (!elements.notesContainer) {
    console.error("Notes container not found");
    return;
  }

  if (notes.length === 0) {
    elements.notesContainer.innerHTML = `
        <div class="empty-state">
            <h2>No notes yet</h2>
            <p>Create your first note to get started!</p>
            <button class="add-note-btn" onclick="openNoteDialog()">+ Add Your First Note</button>
        </div>
        `;
    const addFirstNoteBtn = elements.notesContainer.querySelector(
      ".add-note-btn"
    ) as HTMLButtonElement;
    const currentAccentColor =
      localStorage.getItem("accentColor") ||
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-color")
        .trim();
    updateButtonColor(addFirstNoteBtn, currentAccentColor);
    return;
  }

  elements.notesContainer.innerHTML = notes
    .map(
      (note) => `
        <div class="note-card">
            <h3 class="note-title">${note.title}</h3>
            <p class="note-content">${note.content}</p>
            <div class="note-action">
                <button class="edit-btn" onclick="openNoteDialog('${note.id}')" title="Edit Note">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Delete Note">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </div>
        </div>
        `
    )
    .join("");
}

function openNoteDialog(noteId: string | null = null): void {
  if (
    !elements.noteDialog ||
    !elements.noteTitleInput ||
    !elements.noteContentInput ||
    !elements.dialogTitle
  ) {
    console.error("One or more dialog elements not found.");
    return;
  }

  if (noteId) {
    const noteToEdit = notes.find((note) => note.id === noteId);
    if (noteToEdit) {
      editingNoteId = noteId;
      elements.dialogTitle.textContent = "Edit Note";
      elements.noteTitleInput.value = noteToEdit.title;
      elements.noteContentInput.value = noteToEdit.content;
    }
  } else {
    editingNoteId = null;
    elements.dialogTitle.textContent = "Add New Note";
    elements.noteTitleInput.value = "";
    elements.noteContentInput.value = "";
  }

  elements.noteDialog.showModal();
  elements.noteTitleInput.focus();
}

function closeNoteDialog(): void {
  if (elements.noteDialog) {
    elements.noteDialog.close();
  }
}

function toggleTheme(): void {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.textContent = isDark ? "☀️" : "🌙";
  }
}

function applyStoredTheme(): void {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.textContent = "☀️";
    }
  }
}

function isColorLight(hexColor: string): boolean {
  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

function changeAccentColor(event: Event): void {
  const target = event.target as HTMLInputElement;
  const newColor = target.value;
  document.documentElement.style.setProperty("--accent-color", newColor);
  localStorage.setItem("accentColor", newColor);
  updateButtonColor(elements.addNoteBtn, newColor);
  updateButtonColor(elements.saveNoteBtn, newColor);
  renderNotes(); // Re-render notes to apply color to the "Add Your First Note" button if visible
}

function applyStoredAccentColor(): void {
  const storedColor = localStorage.getItem("accentColor");
  if (!elements.accentColorPicker) {
    console.error("Accent color picker not found.");
    return;
  }

  if (storedColor) {
    document.documentElement.style.setProperty("--accent-color", storedColor);
    elements.accentColorPicker.value = storedColor;
  } else {
    const initialAccentColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-color")
      .trim();
    elements.accentColorPicker.value = initialAccentColor;
  }

  const currentAccentColor = elements.accentColorPicker.value;
  updateButtonColor(elements.addNoteBtn, currentAccentColor);
  updateButtonColor(elements.saveNoteBtn, currentAccentColor);
}

function changeFont(event: Event): void {
  const target = event.target as HTMLSelectElement;
  const newFont = target.value;
  document.body.style.fontFamily = newFont;
  localStorage.setItem("fontFamily", newFont);
}

function applyStoredFont(): void {
  const storedFont = localStorage.getItem("fontFamily");
  if (storedFont) {
    document.body.style.fontFamily = storedFont;
    if (elements.fontSelector) {
      elements.fontSelector.value = storedFont;
    }
  }
}

document.addEventListener("DOMContentLoaded", function (): void {
  applyStoredTheme();
  notes = loadNotes();
  renderNotes();
  applyStoredAccentColor();
  applyStoredFont();

  // Event Listeners
  if (elements.noteForm) {
    elements.noteForm.addEventListener("submit", saveNote);
  } else {
    console.error("Note form not found.");
  }

  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.addEventListener("click", toggleTheme);
  } else {
    console.error("Theme toggle button not found.");
  }

  if (elements.accentColorPicker) {
    elements.accentColorPicker.addEventListener("input", changeAccentColor);
  } else {
    console.error("Accent color picker not found.");
  }

  if (elements.fontSelector) {
    elements.fontSelector.addEventListener("change", changeFont);
  } else {
    console.error("Font selector not found.");
  }

  if (elements.noteDialog) {
    elements.noteDialog.addEventListener(
      "click",
      function (event: MouseEvent): void {
        if (event.target === this) {
          closeNoteDialog();
        }
      }
    );
  } else {
    console.error("Note dialog not found.");
  }
});

// Expose functions to the global scope for inline HTML event handlers
(window as any).openNoteDialog = openNoteDialog;
(window as any).deleteNote = deleteNote;
(window as any).closeNoteDialog = closeNoteDialog;
