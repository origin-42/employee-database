class PromptObj {
    constructor(name, message, type, validate) {
        this.name = name;
        this.message = message;
        this.type = type;
        this.validate = validate;
    }
}
// Create a new object with inquirer format for choices
class Choices extends PromptObj {
        constructor(name, message, type, choices, validation) {
            super(name, message, type, validation);
            this.choices = choices;
        }
}

module.exports = {
    PromptObj,
    Choices
}