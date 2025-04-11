import React, { createContext, useContext } from 'react';

interface TreeItemContextType {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    isHovering: boolean;
    setIsHovering: (value: boolean) => void;
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

    return (
        <TreeItemContext.Provider value={{ isEditing, setIsEditing, isHovering, setIsHovering }}>
            {children}
        </TreeItemContext.Provider>
    );
}; 