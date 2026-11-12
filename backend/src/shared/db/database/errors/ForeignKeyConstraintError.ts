import { PersistenceError } from "./PersistenceError.js";

export class ForeignKeyConstraintError extends PersistenceError {
    constructor(message = "No se puede eliminar el registro porque está siendo referenciado por otros datos") {
        super(message);
    }
}
