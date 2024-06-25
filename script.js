document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll(".grid-item input");

    inputs.forEach(input => {
        const savedName = localStorage.getItem(input.dataset.id);
        if (savedName) {
            input.value = savedName;
        }

        input.addEventListener("focus", (event) => {
            event.target.select();
        });

        input.addEventListener("blur", (event) => {
            const value = event.target.value.trim();
            if (value === "") {
                event.target.value = "Unnamed";
            }
            
            localStorage.setItem(event.target.dataset.id, event.target.value);
        });
    });
});
