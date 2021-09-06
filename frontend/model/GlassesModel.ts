export interface Eye {
    id: number; // backend ID
    add: number;
    axis: number;
    cylinder: number;
    sphere?: number;
}

export interface Glasses {
    id: number; // backend ID
    appearance: string;
    dispensed?: boolean;
    glassesSize: string;
    glassesType: string;
    location?: string;
    od: Eye;
    os: Eye;
    sku: number;
    creationDate: number;
}
