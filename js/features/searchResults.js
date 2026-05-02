(function() {
    const careers = window.careers || [];
    const exams = window.exams || [];

    function getQuery() {
        const params = new URLSearchParams(window.location.search);
        return params.get('q') || "";
    }

    function renderCareers(list) {
        const grid = document.getElementById("careersGrid");
        const group = document.getElementById("careersResultsGroup");
        if (!grid || !group) return;

        if (list.length === 0) {
            group.style.display = 'none';
            return;
        }

        group.style.display = 'block';
        grid.innerHTML = "";

        list.forEach(c => {
            const card = document.createElement("div");
            card.className = "career-card";
            card.innerHTML = `
                <img src="${c.image}" class="career-image" alt="${c.name}" onerror="this.src='https://placehold.co/300x140/e0e7ef/888?text=${encodeURIComponent(c.name)}'">
                <div class="career-info">
                    <h3>${c.name}</h3>
                    <div class="salary">${c.salaryLabel || ''}</div>
                </div>
            `;
            card.onclick = () => {
                if (window.spaGo) window.spaGo(`career.html?key=${c.key}`);
                else window.location.href = `career.html?key=${c.key}`;
            };
            grid.appendChild(card);
        });
    }

    function renderExams(list) {
        const grid = document.getElementById("examsGrid");
        const group = document.getElementById("examsResultsGroup");
        if (!grid || !group) return;

        if (list.length === 0) {
            group.style.display = 'none';
            return;
        }

        group.style.display = 'block';
        grid.innerHTML = "";

        list.forEach(e => {
            const card = document.createElement("div");
            card.className = "career-card"; // Reusing career-card style for consistency
            card.innerHTML = `
                <div style="background: var(--bg-main, #f1f3f4); height: 140px; display: flex; align-items: center; justify-content: center; font-size: 3rem;">📝</div>
                <div class="career-info">
                    <h3>${e.name}</h3>
                    <div class="salary">${e.type || ''}</div>
                </div>
            `;
            card.onclick = () => {
                if (window.spaGo) window.spaGo(`exam.html?key=${e.key}`);
                else window.location.href = `exam.html?key=${e.key}`;
            };
            grid.appendChild(card);
        });
    }

    function initSearchResults() {
        const q = getQuery();
        const display = document.getElementById("searchQueryDisplay");
        if (display) display.textContent = q;

        if (!q) {
            document.getElementById("noResults").style.display = 'block';
            return;
        }

        const filteredCareers = careers.filter(c => 
            (c.name || "").toLowerCase().includes(q.toLowerCase()) || 
            (c.desc || "").toLowerCase().includes(q.toLowerCase())
        );

        const filteredExams = exams.filter(e => 
            (e.name || "").toLowerCase().includes(q.toLowerCase()) || 
            ((e.careers || []).join(" ")).toLowerCase().includes(q.toLowerCase())
        );

        renderCareers(filteredCareers);
        renderExams(filteredExams);

        if (filteredCareers.length === 0 && filteredExams.length === 0) {
            document.getElementById("noResults").style.display = 'block';
        } else {
            document.getElementById("noResults").style.display = 'none';
        }
    }

    window.addEventListener('load', initSearchResults);
    document.addEventListener('spa-navigated', initSearchResults);

})();
