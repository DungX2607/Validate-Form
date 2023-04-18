
function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    let selectorRules = {};
    //2. Hàm thực hiện validate
    function validate(inputElement, rule) {
        let errorMessage
        let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)

        //Lấy ra các rules của selector
        let rules = selectorRules[rule.selector]
 
        //Lặp qua từng rule và kiểm tra
        //Nếu có lỗi thì dừng việc kiểm tra
        for (let i=0; i < rules.length; ++i){
            switch (inputElement.type) {
                case 'çheckbox':
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if(errorMessage) break;
        }
        if (errorMessage) {
            errorElement.innerHTML = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerHTML = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }
        
        return !errorMessage;
    }
    //1. Lấy element của form cần validate
    let formElement = document.querySelector(options.form)

    if (formElement){
        //Khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();
            let isFormValid = true;
            //Thực hiện lặp qua từng rule và validate
            options.rules.forEach(function(rule) {
                let inputElement = formElement.querySelector(rule.selector)
                let isValid = validate(inputElement, rule)

                if(!isValid) {
                    isFormValid = false;
                }
            })

            if(isFormValid) {
                //Trường hợp submit theo javascript
                if(typeof options.onSubmit === 'function') {
                    let enableInput = formElement.querySelectorAll('[name]:not([disabled])')
                    let formValues = Array.from(enableInput).reduce(function(values, input) {
                        values[input.name] = input.value;
                        return values;
                    }, {});

                    options.onSubmit(formValues);
                }
            } 
            //Trường hợp submit theo mặc định của trình duyệt
            else {
                formElement.submit();
            }
        }
        //Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input,...)
        options.rules.forEach(function(rule) {
            //Lưu lại các rules cho input
            // selectorRules[rule.selector] = rule.test;

            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            let inputElement = formElement.querySelector(rule.selector);

            if (inputElement) {
                //Xử lý TH blur khỏi input
                inputElement.onblur = function() {
                    validate(inputElement, rule)
                }

                //Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function() {
                    let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerHTML = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            }
        });
    }
}

//Định nghĩa Rules
Validator.isRequired = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : "Vui lòng nhập trường này !!!"
        }
    }
}

Validator.isEmail = function(selector) {
  return {
        selector: selector,
        test: function(value) {
            let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Vui lòng nhập đúng email !!!'
        }
    }
}

Validator.minLength = function(selector, min) {
  return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự !!!`
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message;
        }
    }
}
