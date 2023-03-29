/* eslint-disable testing-library/no-node-access */
/* eslint-disable jest/no-mocks-import */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import UserList from '../UsersList/UserList';
import { usersService } from '../../services/UsersService';
import allUsers from '../../__mocks__/allUsers';
import allRoles from '../../__mocks__/allRoles';
import user from '@testing-library/user-event'

jest.mock('../../services/UsersService');
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

beforeEach(() => {
    //jest.runOnlyPendingTimers();
    jest.useFakeTimers();
})

afterEach(() => {
    cleanup();
});

describe('UserCreateUpdateModal', () => {
    it('to be opened when "New" button is clicked', () => {
        render(<UserList />);

        expect(screen.getByText("New")).toBeInTheDocument();

        fireEvent.click(screen.getByText("New"));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('render form with empty fields', async () => {
        render(<UserList />);

        fireEvent.click(screen.getByText("New"));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText('firstName').getElementsByTagName('input')[0].getAttribute('value')).toBe('');
        expect(screen.getByLabelText('lastName').getElementsByTagName('input')[0].getAttribute('value')).toBe('');
        expect(screen.getByLabelText('email').getElementsByTagName('input')[0].getAttribute('value')).toBe('');

    });
});

