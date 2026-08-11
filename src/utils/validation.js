export const validateName = (name) => {

    return (
        name.length >= 9 &&
        name.length <= 25
    );

};


export const validateEmail = (email) => {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);

};


export const validateEthiopianPhone = (phone) => {

    const phonePattern =
        /^09\d{8}$/;

    return phonePattern.test(phone);

};


export const validatePassword = (password) => {

    const passwordPattern =
        /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    return passwordPattern.test(password);

};