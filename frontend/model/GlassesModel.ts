export interface Eye {
    id: number; // backend ID
    add?: number;
    axis: number;
    cylinder: number;
    sphere: number;
}

export interface Dispense {
    id: number; // backend ID
    modifyDate: Date|null;
    previousSku: number|null;
}
export interface GlassesSearch {
    glassesType: string;
    od: Eye;
    os: Eye;
}
export interface Glasses extends GlassesSearch{
    id: number; // backend ID
    appearance: string;
    dispensed?: boolean;
    dispense?: Dispense;
    glassesSize: string;
    location?: string;
    sku: number;
    creationDate: number;
    score?: number;
}
