document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const fileInput = document.getElementById('fileInput');
    const processButton = document.getElementById('processButton');
    const downloadButton = document.getElementById('downloadButton');
    const hideOutputCheckbox = document.getElementById('hideOutput');
    const output = document.getElementById('output');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const stats = document.getElementById('stats');

    let resultText = ''; // Переменная для хранения результата

    // Устанавливаем начальную тему
    const storedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(`${storedTheme}-theme`);
    themeToggle.textContent = storedTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.body.classList.remove(`${currentTheme}-theme`);
        document.body.classList.add(`${newTheme}-theme`);
        themeToggle.textContent = newTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';

        localStorage.setItem('theme', newTheme);
    });

    processButton.addEventListener('click', () => {
        if (fileInput.files.length === 0) {
            output.textContent = 'Please select a file.';
            return;
        }

        loadingIndicator.classList.remove('hidden');
        stats.classList.add('hidden'); // Скрываем блок статистики до завершения обработки
        downloadButton.classList.add('hidden'); // Скрываем кнопку загрузки до завершения обработки
        output.style.display = hideOutputCheckbox.checked ? 'none' : 'block'; // Скрываем вывод, если установлена галочка
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            const lines = event.target.result.split('\n');
            const matches = [];
            let dateTime = null;
            let team1 = null;

            lines.forEach(line => {
                line = line.trim();

                if (!line || line.includes('-')) return;

                if (/^\d{2}\.\d{2}\. \d{2}:\d{2}$/.test(line)) {
                    dateTime = line;
                } else if (team1 === null) {
                    team1 = line;
                } else {
                    const team2 = line;
                    matches.push(formatMatch(dateTime, team1, team2));
                    team1 = null;
                }
            });

            if (!hideOutputCheckbox.checked) {
                output.innerHTML = matches.map((match, index) => 
                    `<div class="line">${match}</div>`
                ).join('');
            }

            resultText = matches.join('\n'); // Сохраняем результат в переменной

            const totalLines = lines.length;
            const resultLines = matches.length;
            stats.textContent = `Total lines processed: ${totalLines}, Valid lines: ${resultLines}`;
            stats.classList.remove('hidden'); // Показываем блок статистики

            loadingIndicator.classList.add('hidden'); // Скрываем индикатор загрузки
            downloadButton.classList.remove('hidden'); // Показываем кнопку загрузки
        };

        reader.readAsText(file);
    });

    downloadButton.addEventListener('click', () => {
        const text = resultText; // Используем переменную с результатом
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formatted_matches.txt';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    });

    function formatMatch(dateTimeStr, team1, team2) {
        try {
            dateTimeStr = dateTimeStr.trim();
            let [date, time] = dateTimeStr.split(' ');

            if (date.endsWith('.')) {
                date = date.slice(0, -1);
            }

            const [day, month] = date.split('.').map(Number);
            const year = month >= 9 ? 2024 : 2025;

            return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}\t${time}:00\t${team1}\t${team2}`;
        } catch (error) {
            return `Error processing date_time_str: '${dateTimeStr}' - ${error.message}`;
        }
    }
});
