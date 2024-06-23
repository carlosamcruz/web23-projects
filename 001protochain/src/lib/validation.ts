
/**
 * Validation class
 */
export default class Validation{
    success: boolean;
    message: string;

    /**
     * Creates a new validation object
     * @param success if the validation was successfull
     * @param message The validatio message, if the validation failed
     */
    constructor(success: boolean = true, message: string = ""){
        this.success = success;
        this.message = message;
    }

}