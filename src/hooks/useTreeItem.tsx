import React, { createContext, useContext } from 'react';
import { CardTone } from '@sanity/ui';

interface TreeItemContextType {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    isHovering: boolean;
    setIsHovering: (value: boolean) => void;
    validation: CardTone | undefined;
    setValidation: (value: CardTone | undefined) => void;
}

const TreeItemContext = createContext<TreeItemContextType | undefined>(undefined);

export const useTreeItem = () => {
    const context = useContext(TreeItemContext);
    if (!context) {
        throw new Error('useTreeItem must be used within a TreeItemProvider');
    }
    return context;
};

export const TreeItemProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {

    const [isEditing, setIsEditing] = React.useState(false);
    const [isHovering, setIsHovering] = React.useState(false);
    const [validation, setValidation] = React.useState<CardTone | undefined>(undefined);

    return (
        <TreeItemContext.Provider value={{ isEditing, setIsEditing, isHovering, setIsHovering, validation, setValidation }}>
            {children}
        </TreeItemContext.Provider>
    );
};