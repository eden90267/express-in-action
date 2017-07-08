class User {

    constructor(obj) {
        this.firstName = obj.firstName;
        this.lastName = obj.lastName;
        this.birthday = obj.birthday;
    }

    getName() {
        return `${this.firstName} ${this.lastName}`;
    }

    getAge() {
        return (new Date()) - this.birthday;
    }

}

module.exports = User;