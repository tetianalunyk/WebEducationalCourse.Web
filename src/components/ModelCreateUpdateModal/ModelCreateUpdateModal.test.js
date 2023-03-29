/* eslint-disable testing-library/no-node-access */
/* eslint-disable jest/no-mocks-import */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import { cleanup, fireEvent, render, screen} from '@testing-library/react';
import ModelList from '../ModelsList/ModelList';

jest.mock('../../services/UsersService');
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

beforeEach(() => {
    jest.useFakeTimers();
})

afterEach(() => {
    cleanup();
});

describe('ModelCreateUpdateModal', () => {
    it('to be opened when "New" button is clicked', () => {
        render(<ModelList />);

        expect(screen.getByText("New")).toBeInTheDocument();

        fireEvent.click(screen.getByText("New"));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('render form with empty fields', async () => {
        render(<ModelList />);

        fireEvent.click(screen.getByText("New"));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText('name').getElementsByTagName('input')[0].getAttribute('value')).toBe('');
        expect(screen.getByLabelText('description').getElementsByTagName('textarea')[0].value).toBe('');

    });
});

