const combineBtn = document.getElementById('combine-btn');
const combinedGitignore = document.getElementById('combined-gitignore');
const searchInput = document.getElementById('search-input');
const languageSuggestions = document.getElementById('language-suggestions');
const selectedLanguages = document.getElementById('selected-languages');
const combinedLanguages = document.getElementById('combined-languages');
const downloadBtn = document.getElementById('download-btn');

let allLanguages = [];
let filteredLanguages = [];
let selectedLanguagesList = [];

// Fetch the list of .gitignore files from the GitHub API
fetch('https://api.github.com/repos/github/gitignore/contents')
  .then(response => response.json())
  .then(data => {
    allLanguages = data.map(item => item.name.replace('.gitignore', ''));
    filterLanguages();
  })
  .catch(error => {
    console.error('Error fetching .gitignore files:', error);
  });

// Function to filter and display languages based on search input
function filterLanguages() {
  const searchTerm = searchInput.value.toLowerCase();
  filteredLanguages = allLanguages.filter(language =>
    language.toLowerCase().includes(searchTerm)
  );

  // Clear previous suggestions
  languageSuggestions.innerHTML = '';

  // Create suggestions for filtered languages
  if (searchTerm !== '') {
    filteredLanguages.forEach(language => {
      const suggestion = document.createElement('div');
      suggestion.textContent = language;
      suggestion.addEventListener('click', () => selectLanguage(language));
      languageSuggestions.appendChild(suggestion);
    });
  }
}

// Function to select a language and add it to the badges
function selectLanguage(language) {
  if (!selectedLanguagesList.includes(language)) {
    selectedLanguagesList.push(language);

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = language;

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => removeBadge(language));

    badge.appendChild(closeBtn);
    selectedLanguages.appendChild(badge);
  }

  searchInput.value = '';
  languageSuggestions.innerHTML = '';
}

// Function to remove a badge and its corresponding language
function removeBadge(language) {
  const badges = selectedLanguages.getElementsByClassName('badge');
  Array.from(badges).forEach(badge => {
    if (badge.textContent.replace('×', '').trim() === language) {
      selectedLanguages.removeChild(badge);
      selectedLanguagesList = selectedLanguagesList.filter(lang => lang !== language);
    }
  });
}

// Function to fetch and combine .gitignore files
async function combineGitignore() {
  const selectedLanguageNames = [...selectedLanguagesList];

  if (selectedLanguageNames.length === 0) {
    combinedGitignore.value = 'Please select at least one language.';
    downloadBtn.disabled = true;
    return;
  }

  try {
    const responses = await Promise.all(
      selectedLanguageNames.map(language => fetch(`https://raw.githubusercontent.com/github/gitignore/master/${language}.gitignore`))
    );

    const gitignoreFiles = await Promise.all(
      responses.map(response => response.text())
    );

    const combinedContent = gitignoreFiles.join('\n\n');
    combinedGitignore.value = combinedContent;
    combinedLanguages.textContent = `Combined .gitignore files for: ${selectedLanguageNames.join(', ')}`;
    downloadBtn.disabled = false;
  } catch (error) {
    console.error('Error fetching .gitignore files:', error);
    combinedGitignore.value = 'An error occurred while fetching the .gitignore files.';
    downloadBtn.disabled = true;
  }
}

// Function to download the combined .gitignore file
function downloadGitignore() {
  const combinedContent = combinedGitignore.value;
  if (combinedContent.trim() === '') {
    return; // Do nothing if the textarea is empty
  }
  const blob = new Blob([combinedContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'combined.gitignore';
  link.click();
  URL.revokeObjectURL(url);
}

// Event listener for the search input
searchInput.addEventListener('input', filterLanguages);

// Event listener for language suggestions
languageSuggestions.addEventListener('click', (event) => {
  if (event.target.tagName.toLowerCase() === 'div') {
    const language = event.target.textContent;
    selectLanguage(language);
  }
});

// Event listener for Enter key press
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const searchTerm = searchInput.value.trim();
    if (filteredLanguages.includes(searchTerm)) {
      selectLanguage(searchTerm);
    }
  }
});

// Event listener for the "Combine .gitignore" button
combineBtn.addEventListener('click', combineGitignore);

// Event listener for the "Download .gitignore" button
downloadBtn.addEventListener('click', downloadGitignore);