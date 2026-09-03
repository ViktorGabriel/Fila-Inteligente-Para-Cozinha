import { ValidationError } from "../../core/AppError.js";

export interface OrderItemProps {
    id?:string
    name:string
    quantity:number
    prepTimeMinutes:number
}

export class OrderItem {
    public readonly id: string;
    public readonly name: string;
    public readonly quantity: number;
    public readonly prepTimeMinutes: number;

    constructor(props: OrderItemProps){
        this.id = props.id ?? crypto.randomUUID()
        this.name = props.name
        this.quantity = props.quantity
        if (props.quantity <= 0){
            throw new ValidationError("Invalid quantity")
        }
        this.prepTimeMinutes = props.prepTimeMinutes
        if (props.prepTimeMinutes <= 0){
            throw new ValidationError("Invalid prepTimeMinutes")
        }
    }
}