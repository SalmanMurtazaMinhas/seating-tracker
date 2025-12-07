document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll(".grid-item input");

    const classSelector   = document.getElementById("classSelector");
    const classNameInput  = document.getElementById("classNameInput");
    const saveClassBtn    = document.getElementById("saveClassBtn");
    const newClassBtn     = document.getElementById("newClassBtn");
    const deleteClassBtn  = document.getElementById("deleteClassBtn");

    // gridClasses = { "SEB-BH-7": { "1-1": "Safa", ... }, ... }
    // Separate key name so it doesn't clash with other apps
    let gridClasses = JSON.parse(localStorage.getItem("gridAllClasses")) || {};
    let currentClass = null;

    function saveAllClasses() {
        localStorage.setItem("gridAllClasses", JSON.stringify(gridClasses));
    }

    function clearInputs() {
        inputs.forEach(input => {
            input.value = "";
        });
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
            currentClass = names.length ? names[0] : null;
            if (currentClass) {
                classSelector.value = currentClass;
            }
        }

        classNameInput.value = currentClass || "";
        loadClass(currentClass);
    }

    // Toast helper
    function showToast(message, type = "success") {
        const toast = document.getElementById("toast");
        toast.innerHTML = `
            <span class="${type === "success" ? "toast-success" : "toast-delete"}">
                ${type === "success" ? "✔" : "✖"}
            </span>
            <span>${message}</span>
        `;

        toast.classList.add("show");

        // clear previous timeout if still running
        if (toast._timeoutId) {
            clearTimeout(toast._timeoutId);
        }

        toast._timeoutId = setTimeout(() => {
            toast.classList.remove("show");
        }, 1800);
    }

    // Initialize default class if none exist
    if (Object.keys(gridClasses).length === 0) {
        currentClass = "Class 1";
        gridClasses[currentClass] = {};
        saveAllClasses();
    } else {
        currentClass = Object.keys(gridClasses)[0];
    }

    renderClassOptions();

    // Save / rename current class
    saveClassBtn.addEventListener("click", () => {
        const name = classNameInput.value.trim();
        if (!name) return;

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

        showToast("Class saved", "success");
    });

    // Start a fresh unsaved seating chart
    newClassBtn.addEventListener("click", () => {
        currentClass = null;
        classNameInput.value = "";
        classSelector.value = "";
        clearInputs();
        showToast("New layout started", "success");
    });

    // Delete the currently selected class
    deleteClassBtn.addEventListener("click", () => {
        if (!currentClass) return;

        delete gridClasses[currentClass];
        saveAllClasses();

        const remaining = Object.keys(gridClasses);

        if (remaining.length === 0) {
            currentClass = null;
            classNameInput.value = "";
            classSelector.innerHTML = "";
            clearInputs();
            showToast("Class deleted", "delete");
            return;
        }

        currentClass = remaining[0];
        renderClassOptions();
        showToast("Class deleted", "delete");
    });

    // Change class from dropdown
    classSelector.addEventListener("change", () => {
        currentClass = classSelector.value;
        classNameInput.value = currentClass;
        loadClass(currentClass);
    });

    // Inputs: select on focus, autosave on blur (for currentClass)
    inputs.forEach(input => {
        input.addEventListener("focus", event => {
            event.target.select();
        });

        input.addEventListener("blur", event => {
            let value = event.target.value.trim();
            if (value === "") {
                value = "Unnamed";
                event.target.value = value;
            }

            if (!currentClass) return;

            if (!gridClasses[currentClass]) {
                gridClasses[currentClass] = {};
            }

            gridClasses[currentClass][event.target.dataset.id] = value;
            saveAllClasses();
        });
    });
});
