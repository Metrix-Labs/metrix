import { Dispatch } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { State } from './reducers';

import type { Store } from '@metrixlabs/admin/strapi-admin';

type RootState = ReturnType<Store['getState']> & {
  ['content-manager']: State;
};

const useTypedDispatch: () => Dispatch = useDispatch;
const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export { useTypedSelector, useTypedDispatch };
