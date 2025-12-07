document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll(".grid-item input");

    const classSelector = document.getElementById("classSelector");
    const classNameInput = document.getElementById("classNameInput");
    const saveClassBtn = document.getElementById("saveClassBtn");
    const newClassBtn = document.getElementById("newClassBtn");

    // Use a different key name so it doesn't clash with your other app
    // gridClasses = { "SEB-BH-7": { "1-1": "Safa", ... }, ... }
    let gridClasses = JSON.parse(localStorage.getItem("gridAllClasses")) || {};
    let currentClass = null;

    function saveAllClasses() {
        localStorage.setItem("gridAllClasses", JSON.stringify(gridClasses));
    }

    function clearInputs() {
        inputs.forEach(input => (input.value = ""));
    }

    function loadClass(className) {
        if (!className || !gridClasses[className]) {
            clearInputs();
            return;
        }
        const seatData = gridClasses[className];
        inputs.forEach(input => {
            const id = input.dataset.id;
            input.value = seatData[id] || "";
        });
    }

    function renderClassOptions() {
        classSelector.innerHTML = "";

        Object.keys(gridClasses).forEach(name => {
            const opt = document.createElement("option");
            opt.value = name;
            opt.textContent = name;
            classSelector.appendChild(opt);
        });

        if (currentClass && gridClasses[currentClass]) {
            classSelector.value = currentClass;
        } else {
            const names = Object.keys(gridClasses);
            if (names.length > 0) {
                currentClass = names[0];
                classSelector.value = currentClass;
            } else {
                currentClass = null;
            }
        }

        classNameInput.value = currentClass || "";
        loadClass(currentClass);
    }

    // If no classes yet, create one default
    if (Object.keys(gridClasses).length === 0) {
        currentClass = "Class 1";
        gridClasses[currentClass] = {};
        saveAllClasses();
    } else {
        currentClass = Object.keys(gridClasses)[0];
    }

    renderClassOptions();

    // Save / rename current class with current seat values
    saveClassBtn.addEventListener("click", () => {
        const name = classNameInput.value.trim();
        if (!name) {
            alert("Enter a class name first.");
            return;
        }

        // collect seat data
        const seatData = {};
        inputs.forEach(input => {
            let val = input.value.trim();
            if (val === "") val = "Unnamed";
            input.value = val;
            seatData[input.dataset.id] = val;
        });

        // handle rename
        if (currentClass && name !== currentClass && gridClasses[currentClass]) {
            delete gridClasses[currentClass];
        }

        currentClass = name;
        gridClasses[currentClass] = seatData;
        saveAllClasses();
        renderClassOptions();
        alert("Class saved!");
    });

    // Start a fresh unsaved seating chart
    newClassBtn.addEventListener("click", () => {
        currentClass = null;
        classNameInput.value = "";
        classSelector.value = "";
        clearInputs();
    });

    // Change class from dropdown
    classSelector.addEventListener("change", () => {
        currentClass = classSelector.value;
        classNameInput.value = currentClass;
        loadClass(currentClass);
    });

    // Per-input behavior: select on focus, autosave on blur (if class selected)
    inputs.forEach(input => {
        const savedName = null; // not used now, loading happens via loadClass()

        input.addEventListener("focus", event => {
            event.target.select();
        });

        input.addEventListener("blur", event => {
            let value = event.target.value.trim();
            if (value === "") {
                value = "Unnamed";
                event.target.value = value;
            }

            if (!currentClass) return; // only autosave if some class is active

            if (!gridClasses[currentClass]) {
                gridClasses[currentClass] = {};
            }
            gridClasses[currentClass][event.target.dataset.id] = value;
            saveAllClasses();
        });
    });
});
