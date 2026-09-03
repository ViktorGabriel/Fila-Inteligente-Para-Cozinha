export class AppError extends Error {
    statusCode: number
    message: string

    constructor(message: string, statusCode: number = 400) {
        super(message)
        this.statusCode = statusCode
        this.message = message
    }
}


export class NotFoundError extends AppError {
    constructor(message: string){
        super(message, 404)
        this.name = 'NotFoundError'
    }
}

export class ValidationError extends AppError {
    constructor(message: string){
        super(message,400)
        this.name= 'ValidationError'
    }
}

export class InvalidStateTransitionError extends AppError {
    constructor(message:string){
        super(message, 400)
        this.name = 'InvalidStateTransitionError'
    }
}

