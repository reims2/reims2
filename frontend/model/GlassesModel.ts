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

export interface Glasses {
    id: number; // backend ID
    od: Eye;
    os: Eye;
    glassesType: string;
    appearance: string;
    dispensed?: boolean;
    dispense?: Dispense;
    glassesSize: string;
    location?: string;
    sku: number;
    creationDate: number;
    score?: number;
}

export interface EyeSearch {
    add?: number;
    axis: number;
    cylinder: number;
    sphere: number;
    enabled: boolean;
}

export interface GlassesSearch {
    glassesType: string;
    od: EyeSearch;
    os: EyeSearch;
    highTolerance?: boolean;
}
