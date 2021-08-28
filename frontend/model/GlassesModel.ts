
export interface Dispense {
    id?: number; // backend ID, not always set
    modifyDate: Date|null;
}

export interface Eye {
    id?: number; // backend ID, not always set
    add: number;
    axis: number;
    cylinder: number;
    sphere?: number;
}

export interface Glasses {
    id?: number; // backend ID, not always set
    appearance: string;
    dispense?: Dispense;
    dispensed?: boolean;
    glassesSize: string;
    glassesType: string;
    location?: string;
    od: Eye;
    os: Eye;
    sku: number;
}
