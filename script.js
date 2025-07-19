// DNI, NIE, CIF Validation Functions

// DNI Validation
function validateDNI(dni) {
    const dniRegex = /^(\d{8})([A-Z])$/i;
    const match = dni.match(dniRegex);
    
    if (!match) return false;
    
    const number = parseInt(match[1], 10);
    const letter = match[2].toUpperCase();
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    
    return letter === letters[number % 23];
}

// NIE Validation
function validateNIE(nie) {
    const nieRegex = /^[XYZ]\d{7}[A-Z]$/i;
    
    if (!nieRegex.test(nie)) return false;
    
    // Replace the first letter with corresponding number
    let nieNumber = nie.toUpperCase()
        .replace('X', '0')
        .replace('Y', '1')
        .replace('Z', '2');
    
    // Extract number and letter parts
    const number = parseInt(nieNumber.substring(0, 8), 10);
    const letter = nieNumber.charAt(8);
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    
    return letter === letters[number % 23];
}

// CIF Validation (simplified)
function validateCIF(cif) {
    const cifRegex = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/i;
    
    if (!cifRegex.test(cif)) return false;
    
    const cifUpper = cif.toUpperCase();
    const orgType = cifUpper.charAt(0);
    const number = cifUpper.substring(1, 8);
    const control = cifUpper.charAt(8);
    
    // Calculate control digit/letter
    let sum = 0;
    for (let i = 0; i < 7; i++) {
        const digit = parseInt(number.charAt(i), 10);
        if (i % 2 === 0) {
            // Even positions (0, 2, 4, 6) - multiply by 2
            const doubled = digit * 2;
            sum += doubled > 9 ? Math.floor(doubled / 10) + (doubled % 10) : doubled;
        } else {
            // Odd positions (1, 3, 5) - add directly
            sum += digit;
        }
    }
    
    const controlDigit = (10 - (sum % 10)) % 10;
    const controlLetter = 'JABCDEFGHI'.charAt(controlDigit);
    
    // Some CIF types use letter, others use digit
    const useLetterTypes = ['K', 'P', 'Q', 'S', 'N', 'W'];
    
    if (useLetterTypes.includes(orgType)) {
        return control === controlLetter;
    } else {
        return control === controlDigit.toString();
    }
}

// IBAN Validation
function validateIBAN(iban) {
    // Remove spaces, dashes, and convert to uppercase
    const cleanIban = iban.replace(/[\s\-]/g, '').toUpperCase();
    
    // Check basic format (2 letters for country + 2 digits + up to 30 alphanumeric)
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/;
    if (!ibanRegex.test(cleanIban)) return false;
    
    // Check if it's a Spanish IBAN (ES)
    if (cleanIban.startsWith('ES')) {
        // Spanish IBAN should be 24 characters
        if (cleanIban.length !== 24) return false;
        
        // Move first 4 characters to end and convert letters to numbers
        const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);
        const converted = rearranged.replace(/[A-Z]/g, function(match) {
            return (match.charCodeAt(0) - 55).toString();
        });
        
        // Check if it's divisible by 97
        const remainder = parseInt(converted) % 97;
        return remainder === 1;
    }
    
    // For other countries, we'll do a basic checksum validation
    const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);
    const converted = rearranged.replace(/[A-Z]/g, function(match) {
        return (match.charCodeAt(0) - 55).toString();
    });
    
    const remainder = parseInt(converted) % 97;
    return remainder === 1;
}

// Phone Validation
function validatePhone(phone) {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it starts with Spanish country code
    if (cleanPhone.startsWith('34')) {
        const nationalNumber = cleanPhone.substring(2);
        
        // Mobile numbers (6xx, 7xx)
        if (/^[67]\d{8}$/.test(nationalNumber)) {
            return {
                isValid: true,
                type: 'Móvil',
                prefix: nationalNumber.substring(0, 3)
            };
        }
        
        // Landline numbers (8xx, 9xx)
        if (/^[89]\d{8}$/.test(nationalNumber)) {
            return {
                isValid: true,
                type: 'Fijo',
                prefix: nationalNumber.substring(0, 3)
            };
        }
    }
    
    // Check if it's a national number (without country code)
    if (/^[6789]\d{8}$/.test(cleanPhone)) {
        const type = /^[67]/.test(cleanPhone) ? 'Móvil' : 'Fijo';
        return {
            isValid: true,
            type: type,
            prefix: cleanPhone.substring(0, 3)
        };
    }
    
    return {
        isValid: false,
        type: 'Inválido',
        prefix: null
    };
}

// Email Validation
function validateEmail(email) {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            type: 'Formato inválido'
        };
    }
    
    // Check for common email providers
    const domain = email.split('@')[1].toLowerCase();
    const commonProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
    
    return {
        isValid: true,
        type: commonProviders.includes(domain) ? 'Proveedor común' : 'Dominio personalizado',
        domain: domain
    };
}

// Master validation function
function validateID(id) {
    if (!id || id.trim().length === 0) {
        throw new Error('Por favor, introduce un número de identificación');
    }
    
    const cleanId = id.trim().toUpperCase();
    
    // Check DNI format (8 digits + letter)
    if (/^\d{8}[A-Z]$/i.test(cleanId)) {
        return {
            isValid: validateDNI(cleanId),
            type: 'DNI',
            id: cleanId
        };
    }
    
    // Check NIE format (X/Y/Z + 7 digits + letter)
    if (/^[XYZ]\d{7}[A-Z]$/i.test(cleanId)) {
        return {
            isValid: validateNIE(cleanId),
            type: 'NIE',
            id: cleanId
        };
    }
    
    // Check CIF format (letter + 7 digits + digit/letter)
    if (/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/i.test(cleanId)) {
        return {
            isValid: validateCIF(cleanId),
            type: 'CIF',
            id: cleanId
        };
    }
    
    // If no pattern matches
    return {
        isValid: false,
        type: 'UNKNOWN',
        id: cleanId
    };
}

// UI Functions
function showResult(result, validationType) {
    const resultContainer = document.getElementById('result');
    
    if (result.isValid) {
        let description = '';
        
        switch (validationType) {
            case 'nif':
                description = `${result.id} es un ${result.type} válido<br>ciudadano español con documento<br>reconocido oficialmente`;
                break;
            case 'iban':
                description = `${result.id} es un IBAN válido<br>con estructura y checksum correctos`;
                break;
            case 'phone':
                description = `${result.id} es un número de ${result.type}<br>con prefijo ${result.prefix} válido`;
                break;
            case 'email':
                description = `${result.id} tiene formato válido<br>${result.type}`;
                break;
        }
        
        resultContainer.innerHTML = `
            <div class="result-valid">
                <div class="result-icon valid">✓</div>
                <div class="result-title valid">Válido</div>
                <div class="result-description">
                    ${description}
                </div>
            </div>
        `;
    } else {
        let description = '';
        
        switch (validationType) {
            case 'nif':
                description = `${result.id} no es un documento válido<br>según la normativa española vigente`;
                break;
            case 'iban':
                description = `${result.id} no es un IBAN válido<br>verifica la estructura y checksum`;
                break;
            case 'phone':
                description = `${result.id} no es un número válido<br>verifica el prefijo y formato`;
                break;
            case 'email':
                description = `${result.id} no tiene formato válido<br>verifica el dominio y estructura`;
                break;
        }
        
        resultContainer.innerHTML = `
            <div class="result-valid">
                <div class="result-icon invalid">✕</div>
                <div class="result-title invalid">No válido</div>
                <div class="result-description">
                    ${description}
                </div>
            </div>
        `;
    }
    
    resultContainer.style.display = 'block';
}

function hideResult() {
    const resultContainer = document.getElementById('result');
    resultContainer.style.display = 'none';
}

function showError(message) {
    alert(message);
}

function updateInputPlaceholder() {
    const validationType = document.getElementById('validationType').value;
    const idInput = document.getElementById('idInput');
    
    switch (validationType) {
        case 'nif':
            idInput.placeholder = 'DNI, NIE, CIF';
            idInput.maxLength = 10;
            break;
        case 'iban':
            idInput.placeholder = 'ES91 2100 0418 4502 0005 1332 o ES9121000418450200051332';
            idInput.maxLength = 34;
            break;
        case 'phone':
            idInput.placeholder = '+34 612 345 678 o 612 345 678';
            idInput.maxLength = 15;
            break;
        case 'email':
            idInput.placeholder = 'usuario@dominio.com';
            idInput.maxLength = 100;
            break;
    }
    
    // Clear input and hide result when changing validation type
    idInput.value = '';
    hideResult();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const idInput = document.getElementById('idInput');
    const validateBtn = document.getElementById('validateBtn');
    const validationType = document.getElementById('validationType');
    const privacyLink = document.getElementById('privacyLink');
    const privacyModal = document.getElementById('privacyModal');
    const closeModal = document.querySelector('.close');
    
    // Initialize placeholder
    updateInputPlaceholder();
    
    // Validation type change
    validationType.addEventListener('change', updateInputPlaceholder);
    
    // Validate button click
    validateBtn.addEventListener('click', function() {
        try {
            const inputValue = idInput.value;
            const selectedType = validationType.value;
            
            if (!inputValue || inputValue.trim().length === 0) {
                throw new Error('Por favor, introduce un valor para validar');
            }
            
            let result;
            
            switch (selectedType) {
                case 'nif':
                    result = validateID(inputValue);
                    break;
                case 'iban':
                    result = {
                        isValid: validateIBAN(inputValue),
                        id: inputValue.toUpperCase()
                    };
                    break;
                case 'phone':
                    result = validatePhone(inputValue);
                    result.id = inputValue;
                    break;
                case 'email':
                    result = validateEmail(inputValue);
                    result.id = inputValue;
                    break;
                default:
                    throw new Error('Tipo de validación no válido');
            }
            
            showResult(result, selectedType);
        } catch (error) {
            showError(error.message);
            hideResult();
        }
    });
    
    // Enter key in input field
    idInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            validateBtn.click();
        }
    });
    
    // Clear result when input changes
    idInput.addEventListener('input', function() {
        if (this.value.trim() === '') {
            hideResult();
        }
    });
    
    // Format input based on validation type
    idInput.addEventListener('input', function() {
        const selectedType = validationType.value;
        
        if (selectedType === 'nif') {
            this.value = this.value.toUpperCase();
        } else if (selectedType === 'iban') {
            // Remove all non-alphanumeric characters first
            let cleanValue = this.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
            
            // Format IBAN with spaces every 4 characters
            if (cleanValue.length > 4) {
                let formatted = '';
                for (let i = 0; i < cleanValue.length; i++) {
                    if (i > 0 && i % 4 === 0) {
                        formatted += ' ';
                    }
                    formatted += cleanValue[i];
                }
                this.value = formatted;
            } else {
                this.value = cleanValue;
            }
        }
    });
    
    // Privacy policy modal
    privacyLink.addEventListener('click', function(e) {
        e.preventDefault();
        privacyModal.style.display = 'flex';
    });
    
    // Close modal
    closeModal.addEventListener('click', function() {
        privacyModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    privacyModal.addEventListener('click', function(e) {
        if (e.target === privacyModal) {
            privacyModal.style.display = 'none';
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && privacyModal.style.display === 'flex') {
            privacyModal.style.display = 'none';
        }
    });
});

// Test cases for development (can be removed in production)
function runTests() {
    console.log('Running validation tests...');
    
    // Valid DNI tests
    console.log('12345678Z:', validateDNI('12345678Z')); // Should be true
    console.log('87654321X:', validateDNI('87654321X')); // Should be true
    
    // Invalid DNI tests
    console.log('12345678A:', validateDNI('12345678A')); // Should be false
    console.log('1234567Z:', validateDNI('1234567Z')); // Should be false (wrong length)
    
    // Valid NIE tests
    console.log('X1234567L:', validateNIE('X1234567L')); // Should be true
    console.log('Y1234567X:', validateNIE('Y1234567X')); // Should be true
    
    // Valid CIF tests
    console.log('A12345674:', validateCIF('A12345674')); // Should be true
    console.log('B25162718:', validateCIF('B25162718')); // Should be true
    
    console.log('Tests completed. Check console for results.');
}

// Uncomment the line below to run tests in development
// runTests();
