declare module 'react-window' {
    import * as React from 'react';

    export interface ListChildComponentProps {
        index: number;
        style: React.CSSProperties;
        data?: any;
    }

    export interface FixedSizeListProps extends React.HTMLAttributes<HTMLDivElement> {
        height: number;
        width: number | string;
        itemCount: number;
        itemSize: number;
        children: React.ComponentType<ListChildComponentProps>;
        itemData?: any;
        overscanCount?: number;
    }

    export class FixedSizeList extends React.Component<FixedSizeListProps> {
        scrollTo(scrollOffset: number): void;
        scrollToItem(index: number, align?: 'auto' | 'smart' | 'center' | 'end' | 'start'): void;
        resetAfterIndex(index: number, shouldForceUpdate?: boolean): void;
    }
}
