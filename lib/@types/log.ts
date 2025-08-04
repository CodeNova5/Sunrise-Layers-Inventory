export default interface Log {
    display: string[];
    action: 'create' | 'update' | 'delete'; // The action carried out
    target: string; // The model affected
    details: {
      [key: string]: any
    }, // Any additional details
    targetId: string; // The id of the model affected
    loggerId: string; // The id of the user who carried the action
    createdAt: string;
    id: string;
};

