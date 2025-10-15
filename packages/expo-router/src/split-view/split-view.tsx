import React, { createContext, isValidElement, use, type ReactNode } from 'react';
import {
  SplitViewHost,
  SplitViewScreen,
  type SplitViewHostProps,
} from 'react-native-screens/experimental';

import { SplitViewColumn } from './elements';
import { IsWithinLayoutContext } from '../layouts/withLayoutContext';
import { Slot } from '../views/Navigator';

const IsWithinSplitViewContext = createContext(false);

export interface SplitViewProps extends Omit<SplitViewHostProps, 'children'> {
  children?: ReactNode;
}

function SplitViewNavigator({ children, ...splitViewHostProps }: SplitViewProps) {
  if (use(IsWithinSplitViewContext)) {
    throw new Error('There can only be one SplitView in the navigation hierarchy.');
  }

  // TODO: Add better way of detecting if SplitView is rendered inside Native navigator.
  if (use(IsWithinLayoutContext)) {
    throw new Error('SplitView cannot be used inside another navigator, except for Slot.');
  }

  const WrappedSlot = () => (
    <IsWithinLayoutContext value>
      <Slot />
    </IsWithinLayoutContext>
  );

  const allChildrenArray = React.Children.toArray(children);
  const columnChildren = allChildrenArray.filter(
    (child) => isValidElement(child) && child.type === SplitViewColumn
  );
  const numberOfSidebars = columnChildren.length;

  if (allChildrenArray.length !== columnChildren.length) {
    console.warn('Only SplitView.Column components are allowed as direct children of SplitView.');
  }

  if (numberOfSidebars > 2) {
    throw new Error('There can only be two SplitView.Column in the SplitView.');
  }

  if (numberOfSidebars === 0) {
    console.warn('No SplitView.Column found in SplitView.');
    return <Slot />;
  }

  // The key is needed, because number of columns cannot be changed dynamically
  return (
    <SplitViewHost key={numberOfSidebars} {...splitViewHostProps}>
      {columnChildren}
      <SplitViewScreen.Column>
        <WrappedSlot />
      </SplitViewScreen.Column>
    </SplitViewHost>
  );
}

export const SplitView = Object.assign(SplitViewNavigator, {
  Column: SplitViewColumn,
});
