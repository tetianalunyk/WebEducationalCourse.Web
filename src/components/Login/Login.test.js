/* eslint-disable jest/no-mocks-import */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import { cleanup, fireEvent, render, screen} from '@testing-library/react';
import Login from './Login';
import userEvent from '@testing-library/user-event';

jest.mock('../../services/ModelsService');
jest.mock('../../services/FilesService');
jest.mock('../../services/AuthService');
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

beforeEach(() => {
    jest.useRealTimers();
});

afterEach(cleanup);

describe('Login', () => {
    it('should show error if from is not filled', () => {
        render(<Login />);
        const loginButton = screen.getByText("Login");

        expect(loginButton).toBeInTheDocument();

        fireEvent.click(loginButton);

        expect(screen.getAllByText('This field cannot be empty!')[0]).toBeInTheDocument();
        expect(screen.getAllByText('This field cannot be empty!')[1]).toBeInTheDocument();
    });

    it('should not show error when form correctly filled', async () => {
        jest.setTimeout(7000);
        render(<Login />);
        const emailField = screen.getByLabelText("Email");
        const passwordField = screen.getByLabelText("Password");
        const loginButton = screen.getByText("Login");

        await userEvent.type(emailField, 'test@gmail.com');
        await userEvent.type(passwordField, '1234');
        await userEvent.click(loginButton);

        expect(emailField.value).toBe("test@gmail.com");
        expect(passwordField.value).toBe("1234");
        expect(screen.queryByText('This field cannot be empty!')).not.toBeInTheDocument();
    });

    it('should show error when email is not valid', async () => {
        jest.setTimeout(7000);
        render(<Login />);
        const emailField = screen.getByLabelText("Email");
        const passwordField = screen.getByLabelText("Password");
        const loginButton = screen.getByText("Login");

        await userEvent.type(emailField, 'test@@gmail.com');
        await userEvent.type(passwordField, '1234');
        await userEvent.click(loginButton);

        expect(screen.getByText('Email is not valid!')).toBeInTheDocument();
    });

    it('should show error after second click when form correctly filled', async () => {
        jest.setTimeout(7000);
        render(<Login />);
        const loginButton = screen.getByText("Login");
        await userEvent.click(loginButton);

        expect(screen.getAllByText('This field cannot be empty!')[0]).toBeInTheDocument();
        expect(screen.getAllByText('This field cannot be empty!')[1]).toBeInTheDocument();
        expect(screen.queryByText("The form isn't filled correct — check it out!")).not.toBeInTheDocument();

        await userEvent.click(loginButton);

        expect(screen.getAllByText('This field cannot be empty!')[0]).toBeInTheDocument();
        expect(screen.getAllByText('This field cannot be empty!')[1]).toBeInTheDocument();
        expect(screen.getByText("The form isn't filled correct — check it out!")).toBeInTheDocument();
    });
});

