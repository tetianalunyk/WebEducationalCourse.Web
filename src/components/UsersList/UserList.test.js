/* eslint-disable jest/no-mocks-import */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import UserList from './UserList';
import { usersService } from '../../services/UsersService';
import allUsers from '../../__mocks__/allUsers';
import allRoles from '../../__mocks__/allRoles';
import user from '@testing-library/user-event'

jest.mock('../../services/UsersService');

beforeEach(() => {
    //jest.runOnlyPendingTimers();
    jest.useFakeTimers();
})

afterEach(cleanup);

describe('UserList', () => {
    it('open dialog when "New" button is clicked', () => {
        render(<UserList />);

        expect(screen.getByText("New")).toBeInTheDocument();

        fireEvent.click(screen.getByText("New"));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('render grid with correct users', async () => {
        render(<UserList />);
        jest.spyOn(usersService, 'getAllUsers').mockResolvedValue(allUsers);
        jest.spyOn(usersService, 'getAllRoles').mockResolvedValue(allRoles);

        await waitFor(() => {
            expect(screen.getByText("Tanya")).toBeInTheDocument();
            expect(screen.getByText("Sasha")).toBeInTheDocument();
            expect(screen.getByText("Olya")).toBeInTheDocument();
        });
    });

    it('filter users', async () => {
        render(<UserList />);
        jest.spyOn(usersService, 'getAllUsers').mockResolvedValue(allUsers);
        jest.spyOn(usersService, 'getAllRoles').mockResolvedValue(allRoles);

        const filter = screen.getByLabelText('Filter');
        user.type(filter, 'tan');

        await waitFor(() => {
            expect(screen.getByText('Tanya')).toBeInTheDocument();
            expect(screen.queryByText('Sasha')).toBeNull();
        });
    });
});

